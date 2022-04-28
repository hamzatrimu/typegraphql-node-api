import { Service } from "typedi";
import { User } from "../../db/entity/User";
import { IUserService } from "./interface";
import {
  CreateUserInput,
  LoginUserInput,
  LoginUserOutput,
  UpdateUserInput,
  VerifyUserRegistrationInput,
} from "./types";
import { jwtAuth } from "./utils/jwtAuth";
import { verifyExipryDate, verifyPassword } from "../user/utils/index";
import { sendEmail } from "./utils/nodemailer";
import AuthMapper from "../user/mapper";
import { EMAIL_BODY, EMAIL_SUBJECT } from "../../constants";

@Service()
class UserService implements IUserService {
  async getUsers(): Promise<User[]> {
    const users: User[] | undefined = await User.find();
    if (users.length === 0) throw new Error("No users found");
    return users;
  }

  async getUser(id: number): Promise<User> {
    const user: User | undefined = await User.findOne({ where: { id } });
    if (!user) throw new Error("User not found");
    return user;
  }

  async register(data: CreateUserInput): Promise<LoginUserOutput> {
    let user: User | undefined = await User.findOne({
      where: { email: data.email },
    });
    if (user) throw new Error("User already registered");

    user = await AuthMapper.dtoToEntity(data);

    await sendEmail(data.email, EMAIL_SUBJECT, `${EMAIL_BODY}${user.otp}`);

    await user.save();
    const token = jwtAuth({
      id: user.id,
      email: user.email,
      userType: user.user_type,
    });
    return { user, token };
  }

  async login(data: LoginUserInput): Promise<LoginUserOutput> {
    const user: User | undefined = await User.findOne({
      where: { email: data.email },
    });
    if (!user) throw new Error("Invalid Credentials!");
    const match = await verifyPassword(data.password, user.password);
    if (!match) throw new Error("Invalid Credentials!");
    const token = jwtAuth({
      id: user.id,
      email: user.email,
      userType: user.user_type,
    });

    return { user, token };
  }

  async update(data: UpdateUserInput): Promise<User> {
    let user: User | undefined = await User.findOne({ where: { id: data.id } });
    if (!user) throw new Error("User not found!");
    user = AuthMapper.updateUserData(user, data);
    await user.save();
    return user;
  }

  async delete(id: number): Promise<User> {
    const user = await User.findOne({ where: { id } });
    if (!user) throw new Error("User not found!");
    const deletedUser = await user.remove();
    return deletedUser;
  }

  async verifyUserRegistration(
    data: VerifyUserRegistrationInput
  ): Promise<boolean> {
    let user: User | undefined = await User.findOne({
      where: { email: data.email },
    });
    if (!user) throw new Error("User not found");
    const ifExpired = verifyExipryDate(user.expiry);
    if (!user.otp || user.otp !== data.otp || ifExpired) {
      return false;
    }
    user = AuthMapper.updateUserOTP(user);
    await user.save();
    return true;
  }
}

export default <IUserService>new UserService();
