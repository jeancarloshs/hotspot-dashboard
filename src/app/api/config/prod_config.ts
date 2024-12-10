class ProdConfig {
    API_URL: string | undefined;
    DEBUG_MODE: string | boolean | undefined;
    constructor() {
        this.DEBUG_MODE = process.env.NEXT_PUBLIC_API_URL_DEBUG;
        this.API_URL = process.env.NEXT_PUBLIC_API_URL_PROD;
    }
}

export default ProdConfig;