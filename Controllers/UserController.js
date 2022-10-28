import User from '../Schemas/User.schema.js';
import UserService from '../Services/UserService.js';
class UserController {
    async create(req, res) {
        try {
            const user = await UserService.create(req.body)
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json(e.message)
        }
    }
}
export default new UserController();