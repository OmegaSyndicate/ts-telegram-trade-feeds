import axios from 'axios';

const sleep = timems => new Promise((resolve) => setTimeout(resolve, timems));

export async function request(type: "GET" | "POST", url: string, config?, logger?): Promise<any> {
    try {
        let response;
        switch(type) {
            case "GET":
                response = await axios.get(url, config);
                break;
            case "POST":
                response = await axios.post(url, config);
                break;
            default:
                throw new Error(`Invalid type ${type}`);
        }
        return response.data;
    } catch(error) {
        const errorMessage = `An error occurred during the request.\n${error}`;
        console.error(errorMessage);
        // logger.error(errorMessage);

        await sleep(5000);
        return await request(type, url, config);
    }
}