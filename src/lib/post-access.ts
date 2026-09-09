export function isAdminRole(role?: string) {
  return role === "ADMIN";
}

export function canModifyPost(
  user: { id: string; role?: string } | undefined,
  post: { authorId: string }
): boolean {
  if (!user) return false;
  return isAdminRole(user.role) || user.id === post.authorId;
}
