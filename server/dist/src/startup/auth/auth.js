"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function auth(request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //   get the token from the authorization header
            const token = yield request.headers.authorization.split(" ")[1];
            //check if the token matches the supposed origin
            const jwtSecret = process.env.JWT_SECRET;
            if (!token || token === "null") {
                return response.status(401).json({
                    error: new Error("Invalid request!"),
                });
            }
            const decodedToken = jsonwebtoken_1.default.verify(token, jwtSecret);
            // retrieve the user details of the logged in user
            const user = decodedToken;
            // pass the user down to the endpoints here
            request.user = user;
            // pass down functionality to the endpoint
            next();
        }
        catch (error) {
            response.status(401).json({
                error: new Error("Invalid request!"),
            });
        }
    });
}
exports.default = auth;
