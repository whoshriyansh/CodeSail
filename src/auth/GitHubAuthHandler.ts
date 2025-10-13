// src/auth/GitHubAuthHandler.ts
import * as vscode from "vscode";
import axios from "axios";

export interface UserProfile {
  avatar_url: string;
  email: string;
  username: string;
  accessToken: string;
}

export async function authenticateGitHub(): Promise<UserProfile> {
  try {
    const session = await vscode.authentication.getSession(
      "github",
      ["user:email"],
      {
        createIfNone: true,
      }
    );
    if (!session) {
      throw new Error("GitHub authentication failed.");
    }

    const { data } = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${session.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const userDataForBackend = {
      githubId: data.id,
      username: data.login,
      email: data.email || `${data.login}@github.com`,
      avatarUrl: data.avatar_url,
      accessToken: session.accessToken,
    };

    await axios.post(
      "https://codesail-server.vercel.app/api/auth/register",
      userDataForBackend
    );

    return {
      avatar_url: data.avatar_url,
      email: data.email || `${data.login}@github.com`,
      username: data.login,
      accessToken: session.accessToken,
    };
  } catch (error) {
    throw new Error(`Error during authentication: ${String(error)}`);
  }
}
