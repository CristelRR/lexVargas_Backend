import { Request, Response } from "express";
import usuarioModel from "../models/usuario-model";
import axios from "axios";
import * as crypto from "crypto";
import { enviarCorreo } from "../config/mailer";
import { connectDB } from "../config/db";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import logger from "../logger/logger";
import { registerFailedAttempt, clearFailedAttempts } from "../middlewares/ip-guard.middleware";
import validator from "validator";

class UsuarioController {
  async getUsuarios(req: Request, res: Response) {
    try {
      const usuarios = await usuarioModel.getUsuarios();
      res.json(usuarios);
    } catch (error) {
      logger.error("Error al obtener usuarios: " + error);
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  }

  async login(req: Request, res: Response) {
    const ip = req.ip ?? req.socket?.remoteAddress ?? "unknown";
    try {
      const rawEmail = req.body.email ?? '';
      const rawPassword = req.body.password ?? '';
      const recaptcha = req.body.recaptcha ?? '';

      if (!validator.isEmail(rawEmail)) {
        registerFailedAttempt(ip);
        return res.status(400).json({ message: "Correo inválido" });
      }

      if (validator.isEmpty(rawPassword)) {
        registerFailedAttempt(ip);
        return res.status(400).json({ message: "Contraseña requerida" });
      }

      const email = (validator.normalizeEmail(rawEmail) || '') as string;
      const password = validator.trim(rawPassword);

      const usuario = await usuarioModel.findByEmail(email);
      if (!usuario) {
        registerFailedAttempt(ip);
        return res.status(401).json({ message: "Credenciales incorrectas" });
      }

      const passwordValido = await bcrypt.compare(password, usuario.pass);
      if (!passwordValido) {
        registerFailedAttempt(ip);
        return res.status(401).json({ message: "Credenciales incorrectas" });
      }

      const secretKey = "6LemDAArAAAAANKFrntBm5gGMtjLGGB9X23Ml-RC";
      const recaptchaResponse = await axios.post(
        "https://www.google.com/recaptcha/api/siteverify",
        null,
        { params: { secret: secretKey, response: recaptcha } }
      );

      if (!recaptchaResponse.data.success) {
        registerFailedAttempt(ip);
        return res.status(400).json({ message: "reCAPTCHA inválido" });
      }

      clearFailedAttempts(ip);

      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpiration = Date.now() + 5 * 60 * 1000;

      await usuarioModel.updateOTP(usuario.idUsuario, otp, otpExpiration);

      await enviarCorreo(
        usuario.nombreUsuario,
        "Código de verificación OTP",
        `<p>Tu código de verificación es: <strong>${otp}</strong></p>`
      );

      logger.info(`OTP enviado a ${usuario.nombreUsuario}`);
      return res.json({ message: "OTP enviado", email: usuario.nombreUsuario });

    } catch (error) {
      logger.error("Error en el login: " + error);
      res.status(500).json({ message: "Error al iniciar sesión" });
    }
  }

  async verificarOTP(req: Request, res: Response) {
    try {
      const rawEmail = req.body.email ?? '';
      const rawOtp = req.body.otp ?? '';

      if (!validator.isEmail(rawEmail) || validator.isEmpty(rawOtp)) {
        return res.status(400).json({ message: "Datos inválidos" });
      }

      const email = (validator.normalizeEmail(rawEmail) || '') as string;
      const otp = validator.escape(rawOtp);

      const usuario = await usuarioModel.findByEmail(email);
      if (!usuario) {
        return res.status(400).json({ message: "Usuario no encontrado" });
      }

      const pool = await connectDB();
      const result = await pool
        .request()
        .input("idUsuarioFK", usuario.idUsuario)
        .query("SELECT otp, otpExpiration FROM tblUsuarioOTP WHERE idUsuarioFK = @idUsuarioFK");

      if (result.recordset.length === 0) {
        return res.status(400).json({ message: "OTP no encontrado" });
      }

      const usuarioOTP = result.recordset[0];

      if (usuarioOTP.otp !== otp) {
        return res.status(400).json({ message: "Código OTP incorrecto" });
      }

      if (Date.now() > usuarioOTP.otpExpiration) {
        return res.status(400).json({ message: "Código OTP expirado" });
      }

      await usuarioModel.deleteOTP(usuario.idUsuario);

      const token = jwt.sign(
        {
          id: usuario.idUsuario,
          rol: usuario.idRolFK,
          idEmpleado: usuario.idEmpleadoFK,
          idCliente: usuario.idClienteFK,
        },
        "CLAVE_SECRETA_SUPERSEGURA",
        { expiresIn: "30m" }
      );

      res.json({
        message: "OTP verificado correctamente",
        token,
        usuario: {
          id: usuario.idUsuario,
          nombre: usuario.nombreUsuario,
          rol: usuario.idRolFK,
          idEmpleado: usuario.idEmpleadoFK,
          idCliente: usuario.idClienteFK,
        },
      });
    } catch (error) {
      logger.error("Error al verificar OTP: " + error);
      res.status(500).json({ message: "Error al verificar OTP" });
    }
  }

  async crearUsuario(req: Request, res: Response) {
    try {
      const usuarioData = req.body;

      if (!validator.isEmail(usuarioData.nombreUsuario)) {
        return res.status(400).json({ message: "Correo inválido" });
      }

      usuarioData.nombreUsuario = validator.normalizeEmail(usuarioData.nombreUsuario) ?? '';
      usuarioData.pass = await bcrypt.hash(usuarioData.pass, 10);

      await usuarioModel.crearUsuario(usuarioData);
      res.status(201).json({ message: "Usuario creado exitosamente" });
    } catch (error) {
      logger.error("Error al crear usuario: " + error);
      res.status(500).json({ message: "Error al crear usuario" });
    }
  }

  async updateUsuario(req: Request, res: Response) {
    try {
      const usuarioData = req.body;

      if (usuarioData.nombreUsuario && validator.isEmail(usuarioData.nombreUsuario)) {
        usuarioData.nombreUsuario = validator.normalizeEmail(usuarioData.nombreUsuario) ?? '';
      }

      await usuarioModel.updateUsuario(usuarioData);
      res.json({ message: "Usuario actualizado exitosamente" });
    } catch (error) {
      logger.error("Error al actualizar usuario: " + error);
      res.status(500).json({ message: "Error al actualizar usuario" });
    }
  }

  async deleteUsuario(req: Request, res: Response) {
    try {
      const { idUsuario } = req.body;
      await usuarioModel.deleteUsuario(idUsuario);
      res.json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
      logger.error("Error al eliminar usuario: " + error);
      res.status(500).json({ message: "Error al eliminar usuario" });
    }
  }

  async enviarCorreoRecuperacion(req: Request, res: Response) {
    try {
      const rawEmail = req.body.email ?? '';
      if (!validator.isEmail(rawEmail)) {
        return res.status(400).json({ message: "Correo inválido" });
      }

      const email = (validator.normalizeEmail(rawEmail) || '') as string;
      const usuario = await usuarioModel.findByEmail(email);
      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiration = Date.now() + 15 * 60 * 1000;

      await usuarioModel.guardarTokenRecuperacion(usuario.idUsuario, token, expiration);

      const link = `https://lexvargas-bufet.web.app/restablecer-contrasena/${token}`;
      await enviarCorreo(
        email,
        "Recuperación de Contraseña",
        `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
         <a href="${link}">${link}</a>
         <p>Este enlace expirará en 15 minutos.</p>`
      );

      res.json({ message: "Correo enviado correctamente" });
    } catch (error) {
      logger.error("Error al enviar correo de recuperación: " + error);
      res.status(500).json({ message: "Error interno" });
    }
  }

  async restablecerContrasena(req: Request, res: Response) {
    try {
      const rawToken = req.body.token ?? '';
      const nueva = req.body.nuevaContrasena ?? '';

      const token = validator.escape(rawToken);
      const nuevaContrasena = validator.trim(nueva);

      const registro = await usuarioModel.buscarToken(token);
      if (!registro) {
        return res.status(400).json({ message: "Token inválido" });
      }

      if (Date.now() > registro.expiration) {
        return res.status(400).json({ message: "Token expirado" });
      }

      const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
      await usuarioModel.actualizarContrasena(registro.idUsuarioFK, hashedPassword);
      await usuarioModel.eliminarToken(registro.idUsuarioFK);

      const usuario = await usuarioModel.findById(registro.idUsuarioFK);
      const correoUsuario = usuario[0]?.nombreUsuario;

      if (correoUsuario) {
        await enviarCorreo(
          correoUsuario,
          "Confirmación de cambio de contraseña",
          `<p>Hola,</p>
           <p>Tu contraseña ha sido cambiada exitosamente. Si no realizaste este cambio, por favor contáctanos inmediatamente.</p>`
        );
      }

      res.json({ message: "Contraseña restablecida correctamente" });
    } catch (error) {
      logger.error("Error al restablecer contraseña: " + error);
      res.status(500).json({ message: "Error interno al restablecer contraseña" });
    }
  }

  async extenderSesion(req: Request, res: Response) {
    try {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) {
        return res.status(400).json({ message: "Token no proporcionado" });
      }

      const decoded = jwt.verify(token, 'CLAVE_SECRETA_SUPERSEGURA');

      if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
        const newToken = jwt.sign(
          {
            id: (decoded as JwtPayload).id,
            rol: (decoded as JwtPayload).rol,
            idEmpleado: (decoded as JwtPayload).idEmpleado,
            idCliente: (decoded as JwtPayload).idCliente,
          },
          'CLAVE_SECRETA_SUPERSEGURA',
          { expiresIn: '30m' }
        );

        res.json({
          message: 'Sesión extendida',
          token: newToken,
        });
      } else {
        return res.status(400).json({ message: "Token no válido o mal formado" });
      }
    } catch (error) {
      logger.error('Error al extender la sesión: ' + error);
      res.status(500).json({ message: 'Error al extender la sesión' });
    }
  }

  async cifrarPasswordManual() {
    const email = "cristel23rr@gmail.com";
    const nueva = "Passwd1234";

    const hashed = await bcrypt.hash(nueva, 10);
    const pool = await connectDB();
    await pool.request()
      .input("pass", hashed)
      .input("email", email)
      .query("UPDATE tblUsuario SET pass = @pass WHERE nombreUsuario = @email");
  }
}

export const usuarioController = new UsuarioController();
