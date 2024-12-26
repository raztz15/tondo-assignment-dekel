import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { ILaucngDetails, ILaunchpadDetails, IPayloadDetails, IRocketDetails } from '../interfaces';
import { Box, Button, Card, CardContent, CardMedia, CircularProgress, Stack, Typography } from '@mui/material';

export const LaunchDetails = () => {

    const { id } = useParams<{ id: string }>();
    const [launch, setLaunch] = useState<ILaucngDetails | null>(null);
    const [rocket, setRocket] = useState<IRocketDetails | null>(null);
    const [payloads, setPayloads] = useState<IPayloadDetails[]>([]);
    const [launchpad, setLaunchpad] = useState<ILaunchpadDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchLaunchDetails = async () => {
            setLoading(true);
            try {
                // Fetch the launch details
                const launchResponse = await fetch(`https://api.spacexdata.com/v4/launches/${id}`);
                if (!launchResponse.ok) {
                    throw new Error('Failed to fetch launch details');
                }
                const launchData = await launchResponse.json();
                setLaunch(launchData);

                // Fetch rocket details using the rocket ID
                const rocketResponse = await fetch(`https://api.spacexdata.com/v4/rockets/${launchData.rocket}`);
                if (!rocketResponse.ok) {
                    throw new Error('Failed to fetch rocket details');
                }
                const rocketData = await rocketResponse.json();
                setRocket(rocketData);

                // Fetch payload details using each payload ID
                const payloadDataPromises = launchData.payloads.map((payloadId: string) =>
                    fetch(`https://api.spacexdata.com/v4/payloads/${payloadId}`).then((response) => response.json())
                );
                const payloadData = await Promise.all(payloadDataPromises);
                setPayloads(payloadData);

                // Fetch launchpad details using the launchpad ID
                const launchpadResponse = await fetch(`https://api.spacexdata.com/v4/launchpads/${launchData.launchpad}`);
                if (!launchpadResponse.ok) {
                    throw new Error('Failed to fetch launchpad details');
                }
                const launchpadData = await launchpadResponse.json();
                setLaunchpad(launchpadData);

            } catch (error: unknown) {
                setError((error as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchLaunchDetails();
    }, [id]);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    console.log(launch);


    return (
        <Box>
            <Box>
                {launch ? (
                    <Card>
                        <CardContent>
                            <Typography variant="h4">{launch.name}</Typography>
                            <Typography variant="body1" color="textSecondary">
                                {new Date(launch.date_utc).toLocaleString()}
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mt={2}>
                                {/* Rocket Details Box */}
                                <Box flex={1}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6">Rocket Details</Typography>
                                            <Typography variant="body2">Name: {rocket?.name || 'N/A'}</Typography>
                                            <Typography variant="body2">Type: {rocket?.type || 'N/A'}</Typography>
                                        </CardContent>
                                    </Card>
                                </Box>

                                {/* Image/Video Box */}
                                <Box flex={1}>
                                    {launch.links.webcast && (
                                        <Box display="flex" justifyContent="center" paddingBottom='20px'>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                href={launch.links.webcast}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Watch Launch Webcast
                                            </Button>
                                        </Box>
                                    )}
                                    {launch.links.patch.small && (
                                        <CardMedia
                                            component="img"
                                            alt="Mission Patch"
                                            height="200"
                                            image={launch.links.patch.small}
                                        />
                                    )}
                                </Box>
                            </Stack>

                            {/* Additional Details Box */}
                            <Box mt={3} >
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">Additional Details</Typography>
                                        <Typography variant="body2">Flight Number: {launch.flight_number || 'N/A'}</Typography>
                                        <Typography variant="body2">Launch Site: {launchpad?.name || 'N/A'}</Typography>
                                        {payloads.length > 0 && (
                                            <div>
                                                <Typography variant="body2" mt={1}>Payload Information:</Typography>
                                                <ul>
                                                    {payloads.map((payload, index) => (
                                                        <li key={index}>
                                                            <Typography variant="body2">{payload.name || 'N/A'}</Typography>
                                                            <Typography variant="body2">Type: {payload.type || 'N/A'}</Typography>
                                                            <Typography variant="body2">Mass: {payload.mass_kg ? `${payload.mass_kg} kg` : 'N/A'}</Typography>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </Box>
                        </CardContent>
                    </Card>
                ) : (
                    <Typography variant="body1">Launch details not found.</Typography>
                )}
            </Box>

            {/* Back Button */}
            <Box mt={2}>
                <Button variant="outlined" onClick={() => navigate('/')}>Back to Launch List</Button>
            </Box>
        </Box>
    )
}
