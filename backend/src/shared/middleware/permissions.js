export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not authenticated" });
    }

    const { permissions, role } = req.user;

    // Super Admin and Admin bypass permission checks
    if (role === "Admin" || (permissions && permissions.includes("*"))) {
      return next();
    }

    if (!permissions || !permissions.includes(requiredPermission)) {
      return res
        .status(403)
        .json({
          error: `Forbidden: Missing required permission: ${requiredPermission}`,
        });
    }

    next();
  };
};
