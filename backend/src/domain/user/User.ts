import { v4 as uuidv4 } from 'uuid';

export interface UserProps {
  id: string;
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(params: { googleId: string; email: string; name: string; avatarUrl?: string }): User {
    const now = new Date();
    return new User({
      id: uuidv4(),
      googleId: params.googleId,
      email: params.email,
      name: params.name,
      avatarUrl: params.avatarUrl ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  get id(): string { return this.props.id; }
  get googleId(): string { return this.props.googleId; }
  get email(): string { return this.props.email; }
  get name(): string { return this.props.name; }
  get avatarUrl(): string | null { return this.props.avatarUrl; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  updateProfile(params: { name: string; email: string; avatarUrl?: string }): void {
    this.props.name = params.name;
    this.props.email = params.email;
    if (params.avatarUrl !== undefined) this.props.avatarUrl = params.avatarUrl;
    this.props.updatedAt = new Date();
  }
}
