export interface ILaunch {
    id: string;
    name: string;
    date_utc: string;
    rocket: string;
    success: boolean;
    rocketName?: string;
}

export interface ILaucngDetails {
    name: string;
    date_utc: string;
    rocket: {
        name: string;
        type: string;
    };
    links: {
        patch: {
            small: string;
        };
        webcast: string;
        article: string;
        wikipedia: string;
    };
    payloads: IPayloadDetails[];
    flight_number: number;
    launch_site: string;
}

export interface IRocketDetails {
    id: string
    name: string;
    type: string;
}

export interface IPayloadDetails {
    id: number
    name: string;
    type: string;
    mass_kg: number;
}

export interface ILaunchpadDetails {
    name: string;
    location: {
        name: string;
    };
}