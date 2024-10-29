import { Request, Response } from "express";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../database/models/userModel";
import { AuthRequest } from "../middleware/authMiddleware";

class AuthController {
  public static async registerUser(req: Request, res: Response): Promise<void> {
    const { username, email, password, role } = req.body;
    console.log(role);
    if (!username || !email || !password) {
      res.status(400).json({
        message: "Please provide username,email,password",
      });
      return;
    }

    await User.create({
      username,
      email,
      password: bcrypt.hashSync(password, 12),
      role: role,
    });

    res.status(200).json({
      message: "User registered successfully",
    });
  }

  public static async loginUser(req: Request, res: Response): Promise<void> {
    // user input
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        message: "Please provide email,password",
      });
      return;
    }
    // check whether user with above email exist or not

    const [data] = await User.findAll({
      where: {
        email: email,
      },
    });
    if (!data) {
      res.status(404).json({
        message: "No user with that email",
      });
      return;
    }

    // check password now
    const isMatched = bcrypt.compareSync(password, data.password);
    if (!isMatched) {
      res.status(403).json({
        message: "Invalid password",
      });
      return;
    }

    // generate token
    const token = jwt.sign({ id: data.id }, process.env.SECRET_KEY as string, {
      expiresIn: "20d",
    });
    res.status(200).json({
      message: "Logged in successfully",
      data: token,
    });
  }

  public static async fetchUsers(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    const users = await User.findAll();
    if (users.length > 0) {
      res.status(200).json({
        message: "User fetched successfully",
        data: users,
      });
    } else {
      res.status(404).json({
        message: "you haven't any user ",
        data: [],
      });
    }
  }

  public static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    const data = await User.findAll({
      where: {
        id,
      },
    });
    if (data.length === 0) {
      res.status(404).json({
        message: "No category with that id",
      });
    } else {
      await User.destroy({
        where: {
          id,
        },
      });
      res.status(200).json({
        message: "Usr deleted Successfully",
      });
    }
  }
}

export default AuthController;
