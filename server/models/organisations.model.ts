import { Schema, model, models, Model } from 'mongoose';
import { IOrganization } from '../types';

const OrganizationSchema = new Schema<IOrganization>(
  {
    orgId: { type: Number, required: true, unique: true },
    installationId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    avatarUrl: { type: String, required: true },
    url: { type: String, required: true },
    reposUrl: { type: String, required: true },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    repositories: [{ type: Schema.Types.ObjectId, ref: 'Repository' }]
  },
  { timestamps: true }
);

export const Organization: Model<IOrganization> =
  (models.Organization as Model<IOrganization>) ||
  model<IOrganization>('Organization', OrganizationSchema);
