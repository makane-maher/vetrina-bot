export enum BitbucketEventType {
  COMMIT_NEW = 'repo:push',
  PR_NEW = 'pullrequest:created',
  PR_UPDATE = 'pullrequest:updated',
  PR_CHANGE_REQUEST = 'pullrequest:changes_request_created',
  PR_APPROVED = 'pullrequest:approved',
  PR_REMOVED = 'pullrequest:unapproved',
  PR_MERGED = 'pullrequest:fulfilled',
  PR_DECLINED = 'pullrequest:rejected',
  COMMENT_NEW = 'pullrequest:comment_created',
}

export enum PropertyType {
  BRANCH = 'branch',
  BUILD = 'build',
  COMMIT = 'commit',
  PARTICIPANT = 'PARTICIPANT',
  PROJECT = 'project',
  PULL_REQUEST_COMMENT = 'pullrequest_comment',
  REPOSITORY = 'repository',
  TAG = 'tag',
  USER = 'user',
  WORKSPACE = 'workspace',
}

export enum PullRequestStatus {
  OPEN = 'OPEN',
  MERGED = 'MERGED',
  DECLINED = 'DECLINED',
}

export type SCM = 'git' | 'hg';

export type HrefType = {
  href: string;
};

export type Links = {
  self: HrefType;
  html: HrefType;
  [key: string]: HrefType;
};

export type Rendered = {
  type: string;
  raw?: string;
  markup?: string;
  html?: string;
};

/**
 * The 'User' of each Bitbucket interaction reported through the webhook.
 */
export type Actor = {
  /**
   * @property
   * The type of the property, in this case `"user"`.
   */
  type: PropertyType.USER;

  /**
   * @property
   * The value of this field will change
   * depending on the privacy settings of the user account
   * and the relationship between the requesting user and the target user.
   *
   * This field will always have some value.
   */
  display_name: string;

  /**
   * @property
   * Link to the user's profile and avatar.
   */
  links: Links;

  /**
   * @property
   * Bitbucket account ID.
   */
  account_id: string;

  /**
   * @property
   * *New* - A new user identifier which is easily customized
   * and always publicly visible.
   * This user identifier will not be required to be unique to that user.
   */
  nickname: string;
};

export type Participant = {
  type: PropertyType.PARTICIPANT;
  user: Actor;
  role: string;
  approved: boolean;
  state?: string;
  participated_on?: string;
};

export type Project = {};

/**
 * Repository type from Bitbucket webhooks.
 */
export type Repository = {
  /**
   * @property
   * The type of the property, `"repository"` in this case.
   */
  type: PropertyType.REPOSITORY;

  /**
   * @property
   * The name of the repository.
   */
  name: string;

  /**
   * @property
   * The workspace and repository slugs joined with a slash `/`.
   */
  full_name: string;

  /**
   * @property
   * Links to the repository and avatar.
   */
  links: Links;

  /**
   * `true` or `false` to indicate whether the repository is private.
   */
  is_private?: boolean;

  /**
   * @property
   * The project that contains the repository (if one does).
   */
  project?: Project;

  /**
   * @property
   * The URL to the repository's website when the code is hosted for a specific website.
   */
  website?: string;

  /**
   * @property
   * The type repository: Git (`git`) or Mercurial (`hg`).
   */
  scm?: SCM;
};

/**
 * Pull request in Bitbucket webhook payload.
 */
export type PullRequest = {
  /**
   * The id number that identifies the pull request.
   */
  id: number;

  /**
   * @property
   * The name of the pull request.
   */
  title: string;

  /**
   * @property
   * The description of the pull request.
   */
  description: string;

  /**
   * The state of the pull request.
   */
  state: PullRequestStatus;

  /**
   * The author of the pull request.
   */
  author: Actor;

  /**
   * @property
   * Information about the source of the pull request.
   */
  source: {
    branch: {
      name: string;
    };
    commit: {
      hash: string;
    };
    repository: Repository;
  };
  /**
   * @property
   * Information about the destination of the pull request.
   */
  destination: {
    branch: {
      name: string;
    };
    commit: {
      hash: string;
    };
    repository: Repository;
  };

  /**
   * @property
   * The merge commit hash - when PR is merged.
   */
  merge_commit?: {
    hash: string;
  };

  /**
   * @property
   * A list of participants part of the pull request.
   */
  participants?: Participant[];

  /**
   * @property
   * A list of reviewers on the pull request.
   */
  reviewers?: Actor[];

  /**
   * @property
   * `true` or `false` to indicate whether Bitbucket
   * should close the source branch after the pull requests is successfully merged.
   * Only use this parameter when the source and destination are in the same repo.
   */
  close_source_branch: boolean;

  /**
   * @property
   * The user who closes the pull request, either by merging or declining it.
   */
  closed_by?: Actor;

  /**
   * @property
   * The reason the pull request is declined (if necessary).
   */
  reason?: string;

  /**
   * @property
   * The date and time (in ISO 8601 format) the pull request was created.
   */
  created_on: string;

  /**
   * @property
   * The date and time (in ISO 8601 format) the pull request was last updated.
   */
  updated_on: string;

  /**
   * @property
   * Links to representations of the pull request in the API or on Bitbucket.
   */
  links: Links;

  comment_count?: number;
  task_count?: number;
  rendered?: {
    title: Rendered;
    description: Rendered;
  };
  summary?: Rendered;
};

export type PullRequestComment = {
  id: number;
  created_on: string;
  updated_on: string;
  content: Rendered;
  parent?: Partial<PullRequestComment>;
  inline?: {
    path: string;
    from?: number;
    to?: number;
  };
  user: Actor;
  deleted: boolean;
  type: PropertyType.PULL_REQUEST_COMMENT;
  links: Links;
  pullrequest: Partial<PullRequest>;
};

export type PullRequestApproval = {
  date: string;
  user: Actor;
};

export type PullRequestWebhook = {
  actor: Actor;
  pullrequest: PullRequest;
  repository: Repository;
  approval?: PullRequestApproval;
};

export type CommentWebhook = {
  actor: Actor;
  comment: PullRequestComment;
  pullrequest: PullRequest;
  repository: Repository;
};
