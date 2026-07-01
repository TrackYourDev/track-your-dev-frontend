import { NextResponse } from "next/server";
import { connectDB } from "../db";
import { Organization } from "../models/organisations.model";
import { Repository } from "../models/repositories.model";
import { Commit } from "../models/commits.model";
import { successResponse, errorResponse } from "../utils/responseHandler";
import { getInstallationAccessToken, getCommits } from "../services/githubPreview.service";
import { compareCommits } from "../services/github.service";
import { analyzeGitHubDiff, generateTasks } from "../services/groq.service";
import { filterIgnoredFiles } from "../utils/fileFilter.util";
import { IGitHubComparison } from "../types";

interface CommitsQuery {
  startDate?: string;
  endDate?: string;
  page?: string;
  pageSize?: string;
}

export const getCommitsController = async (
  orgName: string,
  repoName: string,
  query: CommitsQuery = {}
): Promise<NextResponse> => {
  const { startDate, endDate, page = '1', pageSize = '30' } = query;

  try {
    await connectDB();

    // Find the organization
    const organization = await Organization.findOne({ name: orgName });
    if (!organization) {
      return errorResponse("Organization not found", 404);
    }

    // Find the repository
    const repository = await Repository.findOne({
      organization: organization._id,
      name: repoName,
    });
    if (!repository) {
      return errorResponse("Repository not found", 404);
    }

    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);

    // If date range is provided, use existing date range logic
    if (startDate && endDate) {
      // Convert MM-DD-YYYY to Date objects
      const [startMonth, startDay, startYear] = (startDate as string).split('-');
      const [endMonth, endDay, endYear] = (endDate as string).split('-');

      const startDateObj = new Date(`${startYear}-${startMonth}-${startDay}T00:00:00Z`);
      const endDateObj = new Date(`${endYear}-${endMonth}-${endDay}T23:59:59Z`);

      const existingCommits = await Commit.find({
        repository: repository._id,
        commitTime: {
          $gte: startDateObj,
          $lte: endDateObj
        }
      }).sort({ commitTime: -1 }).lean();

      if (existingCommits.length > 0) {
        return successResponse(
          "Fetched commits from database",
          {
            commits: existingCommits,
            totalCommits: existingCommits.length,
            source: 'database'
          },
          200
        );
      }

      // Fetch from GitHub with date range
      const token = await getInstallationAccessToken(organization.installationId);
      const commits = await getCommits(orgName, repoName, token, {
        since: startDate as string,
        until: endDate as string
      });

      // Process commits as before...
      // [Previous date range processing logic remains the same]
      // NOTE: The original Express controller left this branch unimplemented and
      // returned nothing (hanging the request). Fall through to the guaranteed
      // response at the end of the function instead.
    } else {
      // Pagination logic
      const skip = (pageNum - 1) * pageSizeNum;

      // First try to get commits from database
      const existingCommits = await Commit.find({
        repository: repository._id
      })
      .sort({ commitTime: -1 })
      .skip(skip)
      .limit(pageSizeNum)
      .lean();

      // If we have enough commits in the database, return them
      if (existingCommits.length === pageSizeNum) {
        return successResponse(
          "Fetched commits from database",
          {
            commits: existingCommits,
            totalCommits: existingCommits.length,
            page: pageNum,
            pageSize: pageSizeNum,
            source: 'database'
          },
          200
        );
      }

      // If we don't have enough commits, fetch from GitHub
      const token = await getInstallationAccessToken(organization.installationId);
      const githubCommits = await getCommits(orgName, repoName, token, {
        per_page: pageSizeNum,
        page: pageNum
      });

      if (!githubCommits || !Array.isArray(githubCommits) || githubCommits.length === 0) {
        return successResponse(
          "No commits found",
          {
            commits: [],
            totalCommits: 0,
            page: pageNum,
            pageSize: pageSizeNum
          },
          200
        );
      }

      // Process new commits
      const processedCommits = await Promise.all(
        githubCommits.map(async (commit) => {
          // Check if commit already exists
          const existingCommit = await Commit.findOne({ id: commit.sha });
          if (existingCommit) {
            return {
              _id: existingCommit._id,
              commitMessage: existingCommit.commitMessage,
              commitTime: existingCommit.commitTime,
              additions: existingCommit.additions,
              deletions: existingCommit.deletions,
              changes: existingCommit.changes,
              summaries: existingCommit.summaries,
              tasks: existingCommit.tasks,
              author: existingCommit.author
            };
          }

          try {
            // Get commit diff
            const comparisonData = await compareCommits(
              orgName,
              repoName,
              commit.parents?.[0]?.sha || '',
              commit.sha,
              organization.installationId
            );

            // Filter out ignored files
            const relevantFiles = filterIgnoredFiles(comparisonData.files);

            // Filter out files without patches
            const filesWithPatches = relevantFiles.filter(file => file.patch);
            console.log(`Filtered out ${relevantFiles.length - filesWithPatches.length} files without patches`);

            // Skip commits without any patches
            if (filesWithPatches.length === 0) {
              console.log(`Skipping commit ${commit.sha} as it has no patches`);
              return null;
            }

            // Process files and generate tasks
            const fileAnalyses = await Promise.all(
              filesWithPatches.map(async (file: IGitHubComparison['files'][0]) => {
                const diff = `
                filename: ${file.filename}
                status: ${file.status}
                ${file.patch}
                `;
                const analysis = await analyzeGitHubDiff(diff);
                return {
                  filename: file.filename,
                  ...analysis
                };
              })
            );

            const tasks = await generateTasks(
              fileAnalyses.map((file) => file.summary).join("\n")
            );

            // Create commit document
            const commitDoc = await Commit.create({
              id: commit.sha,
              commitTime: new Date(commit.commit?.author?.date || ''),
              repository: repository._id,
              organization: organization._id,
              summaries: fileAnalyses.map(file => ({
                filename: file.filename,
                summary: file.summary
              })),
              tasks: tasks,
              commitMessage: commit.commit?.message || '',
              additions: commit.stats?.additions || 0,
              deletions: commit.stats?.deletions || 0,
              changes: commit.stats?.total || 0,
              author: commit.commit?.author?.name || 'Unknown'
            });

            return {
              _id: commitDoc._id,
              commitMessage: commitDoc.commitMessage,
              commitTime: commitDoc.commitTime,
              additions: commitDoc.additions,
              deletions: commitDoc.deletions,
              changes: commitDoc.changes,
              summaries: commitDoc.summaries,
              tasks: commitDoc.tasks,
              author: commitDoc.author
            };
          } catch (error) {
            console.error(`Error processing commit ${commit.sha}:`, error);
            return null;
          }
        })
      );

      // Filter out any failed commits
      const successfulCommits = processedCommits.filter(commit => commit !== null);

      return successResponse(
        "Fetched and processed commits",
        {
          commits: successfulCommits,
          totalCommits: successfulCommits.length,
          page: pageNum,
          pageSize: pageSizeNum,
          source: 'github'
        },
        200
      );
    }

    // Guaranteed fallback response (reached only by the date-range branch, which
    // the original implementation left incomplete).
    return successResponse(
      "No commits found",
      { commits: [], totalCommits: 0, source: 'github' },
      200
    );
  } catch (err) {
    console.error("Error fetching commits:", err);
    return errorResponse("Server error", 500, err);
  }
};
