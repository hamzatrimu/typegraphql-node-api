import { Arg, Query, Resolver } from "type-graphql";
import { UserCourse } from "../../../db/entity/UserCourse";
import { UserCourseInput } from "../types";
import UserCourseService from "../service";

/**
 * Resolver to get a specific user-course based on user and course ids
 */
@Resolver()
export class GetUserCourse {
  @Query(() => UserCourse)
  async getUserCourse(@Arg("req") req: UserCourseInput): Promise<UserCourse> {
    return await UserCourseService.getUserCourse(req);
  }
}
