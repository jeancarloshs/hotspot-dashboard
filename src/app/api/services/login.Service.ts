import axios from "axios";
import ProdConfig from "../config/prod_config";

interface LoginProps {
	userEmail: string;
	userPassword: string;
}

class LoginService {
  private _environment: ProdConfig;

  constructor() {
    this._environment = new ProdConfig();
  }

  async login({ userEmail, userPassword }: LoginProps): Promise<any> {
    let headersList = {
      "Accept": "*/*",
      "Content-Type": "application/json"
    };

    let bodyContent = JSON.stringify({
      "email": userEmail,
      "password": userPassword
    });

    let reqOptions = {
      url: `${this._environment.API_URL}/login`,
      method: "POST",
      headers: headersList,
      data: bodyContent
    };

		let response = await axios.request(reqOptions);
		return response;
  }
}

export default LoginService;