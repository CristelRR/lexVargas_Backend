import { connectDB } from "../config/db";
import logger from "../logger/logger";


class UsuarioModel {
  async findByEmail(email: string) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("email", email)
      .query("SELECT * FROM tblUsuario WHERE nombreUsuario = @email");
    return result.recordset[0];
  }

  async getUsuarios() {
    const pool = await connectDB();
    const result = await pool.request().query("SELECT * FROM tblUsuario");
    return result.recordset;
  }

  async crearUsuario(usuarioData: any) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("nombreUsuario", usuarioData.nombreUsuario)
      .input("pass", usuarioData.pass)
      .input("estado", usuarioData.estado)
      .input("idRolFK", usuarioData.idRolFK).query(`
                INSERT INTO tblUsuario 
                (nombreUsuario, pass, estado, idRolFK) 
                VALUES (@nombreUsuario, @pass, @estado, @idRolFK)
            `);
    return result;
  }

  async updateUsuario(usuarioData: any) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("idUsuario", usuarioData.idUsuario)
      .input("nombreUsuario", usuarioData.nombreUsuario)
      .input("pass", usuarioData.pass)
      .input("estado", usuarioData.estado)
      .input("idRolFK", usuarioData.idRolFK).query(`
                UPDATE tblUsuario 
                SET 
                    nombreUsuario = @nombreUsuario,
                    pass = @pass,
                    estado = @estado,
                    idRolFK = @idRolFK 
                WHERE idUsuario = @idUsuario
            `);
    return result;
  }

  async deleteUsuario(idUsuario: number) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("idUsuario", idUsuario)
      .query("DELETE FROM tblUsuario WHERE idUsuario = @idUsuario");
    return result;
  }

  async findById(idUsuario: number) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("idUsuario", idUsuario)
      .query("SELECT * FROM tblUsuario WHERE idUsuario = @idUsuario");
    return result.recordset;
  }

  async updateOTP(idUsuarioFK: number, otp: string, otpExpiration: number) {
    try {
      const pool = await connectDB();

      // 🔍 Agregar log para ver si la función se ejecuta correctamente

      const result = await pool
        .request()
        .input("idUsuarioFK", idUsuarioFK)
        .input("otp", otp)
        .input("otpExpiration", otpExpiration).query(`
                    IF EXISTS (SELECT 1 FROM tblUsuarioOTP WHERE idUsuarioFK = @idUsuarioFK)
                    BEGIN
                        UPDATE tblUsuarioOTP 
                        SET otp = @otp, otpExpiration = @otpExpiration 
                        WHERE idUsuarioFK = @idUsuarioFK
                    END
                    ELSE
                    BEGIN
                        INSERT INTO tblUsuarioOTP (idUsuarioFK, otp, otpExpiration)
                        VALUES (@idUsuarioFK, @otp, @otpExpiration)
                    END
                `);

    } catch (error) {
      console.error("Error al insertar OTP en la base de datos:", error);
    }
  }

  async deleteOTP(idUsuarioFK: number) {
    try {
      const pool = await connectDB();
      await pool
        .request()
        .input("idUsuarioFK", idUsuarioFK)
        .query("DELETE FROM tblUsuarioOTP WHERE idUsuarioFK = @idUsuarioFK");

    } catch (error) {
      console.error("Error al eliminar OTP:", error);
    }
  }

  async guardarTokenRecuperacion(
    idUsuarioFK: number,
    token: string,
    expiration: number
  ) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("idUsuarioFK", idUsuarioFK)
      .input("token", token)
      .input("expiration", expiration).query(`
            IF EXISTS (SELECT 1 FROM tblPasswordReset WHERE idUsuarioFK = @idUsuarioFK)
            BEGIN
              UPDATE tblPasswordReset
              SET token = @token, expiration = @expiration
              WHERE idUsuarioFK = @idUsuarioFK
            END
            ELSE
            BEGIN
              INSERT INTO tblPasswordReset (idUsuarioFK, token, expiration)
              VALUES (@idUsuarioFK, @token, @expiration)
            END
          `);
    return result;
  }

  async buscarToken(token: string) {
    const pool = await connectDB();
    const result = await pool.request()
      .input("token", token)
      .query(`SELECT * FROM tblPasswordReset WHERE token = @token`);
    return result.recordset[0];
  }
  
  async actualizarContrasena(idUsuario: number, nuevaContrasena: string) {
    const pool = await connectDB();
    const result = await pool.request()
      .input("idUsuario", idUsuario)
      .input("nuevaPass", nuevaContrasena)  // La contraseña se guarda sin encriptación
      .query(`UPDATE tblUsuario SET pass = @nuevaPass WHERE idUsuario = @idUsuario`);
    return result;
  }
  
  
  async eliminarToken(idUsuarioFK: number) {
    const pool = await connectDB();
    const result = await pool.request()
      .input("idUsuarioFK", idUsuarioFK)
      .query(`DELETE FROM tblPasswordReset WHERE idUsuarioFK = @idUsuarioFK`);
    return result;
  }
  
}

const usuarioModel = new UsuarioModel();
export default usuarioModel;