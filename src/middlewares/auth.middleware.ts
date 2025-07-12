import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, 'CLAVE_SECRETA_SUPERSEGURA');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};

export const verificarRol = (rolEsperado: number) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.rol !== rolEsperado) {
      return res.status(403).json({ message: 'Acceso denegado por rol' });
    }
    next();
  };
};

export const verificarCualquierRol = (rolesPermitidos: number[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const rolUsuario = req.user?.rol;

    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({ message: 'Acceso denegado por rol' });
    }

    next();
  };
};

