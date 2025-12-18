const authService = require("../services/auth.service");

async function register(req, res, next) {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      currency,
      company_name,
      address,
      tax_id,
      logo_url,
    } = req.body;

    // Required fields
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        status: "error",
        message: "Email, mot de passe, prénom et nom sont requis",
      });
    }

    const result = await authService.register({
      email,
      password,
      first_name,
      last_name,
      currency,
      company_name,
      address,
      tax_id,
      logo_url,
    });

    return res.status(201).json({
      status: "success",
      data: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email et mot de passe requis",
      });
    }

    const result = await authService.login({ email, password });

    return res.json({
      status: "success",
      data: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

// POST /auth/refresh  { refreshToken }
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: "error",
        message: "refreshToken requis",
      });
    }

    const tokens = await authService.refresh(refreshToken);

    return res.json({
      status: "success",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

// POST /auth/logout  { refreshToken }
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: "error",
        message: "refreshToken requis",
      });
    }

    await authService.logout(refreshToken);

    return res.json({
      status: "success",
      message: "Déconnecté",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
};
