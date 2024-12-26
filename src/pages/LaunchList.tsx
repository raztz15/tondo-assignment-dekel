import React from 'react';
import { useEffect, useState } from 'react'
import { ILaunch, IRocketDetails } from '../interfaces';
import { Pagination, Card, CardContent, Typography, CircularProgress, TextField, Stack, Box, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import { useDebouncer } from '../hooks/useDecouncer';
import { sortLaunches } from '../utils';

export const LaunchList = () => {

    const [launches, setLaunches] = useState<ILaunch[]>([]);
    const [filteredLaunches, setFilteredLaunches] = useState<ILaunch[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [sortCriteria, setSortCriteria] = useState<string>('date');
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 12;

    const debouncer = useDebouncer(searchQuery, 500)

    // Fetch launches from SpaceX API using fetch
    useEffect(() => {
        fetchLaunches()
    }, [])

    useEffect(() => {
        setCurrentPage(1)
        // Filter launches based on search query
        const updatedLaunches = launches.filter(launch => launch.name.toLowerCase().includes(debouncer.toLowerCase()))
        setFilteredLaunches(updatedLaunches)
    }, [launches, debouncer])

    const fetchLaunches = async () => {
        try {
            setLoading(true);
            // Fetch past launches
            const lauchesResponse = await fetch('https://api.spacexdata.com/v4/launches/past/');
            if (!lauchesResponse.ok) {
                throw new Error('Failed to fetch launches');
            }

            const lauchesData: ILaunch[] = await lauchesResponse.json();

            const rocketResponse = await fetch('https://api.spacexdata.com/v4/rockets')
            if (!rocketResponse.ok) {
                throw new Error('Failed to fetch rockets')
            }

            const rocketMap: Map<string, IRocketDetails> = new Map()
            const rocketData: IRocketDetails[] = await rocketResponse.json()
            rocketData.forEach(rocket => rocketMap.set(rocket.id, rocket))

            // Fetch rocket details for each launch by its rocket ID
            const updatedLaunches = lauchesData.map(launch => {
                const currentRocket = rocketMap.get(launch.rocket)
                if (!currentRocket) console.warn(`Rocket details not found for ID: ${launch.rocket}`)
                return { ...launch, rocketName: currentRocket?.name || 'Unknown Rocket' }
            })

            setLaunches(updatedLaunches);

        } catch (error: unknown) {
            setError((error as Error).message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const sortedLaunches = sortLaunches(filteredLaunches, sortCriteria)

    // Slice the launches array to only show the current page's items
    const currentLaunches = sortedLaunches.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );


    // Handle page change
    const handlePageChange = (value: number) => {
        setCurrentPage(value);
    };

    return (
        <div className="launch-list-container">
            <Typography variant="h3" gutterBottom align="center">
                SpaceX Launches
            </Typography>
            {/* Search Bar */}
            <TextField
                label="Search by Mission Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Sorting Dropdown */}
            <TextField
                select
                label="Sort By"
                value={sortCriteria}
                onChange={(e) => setSortCriteria(e.target.value)}
                fullWidth
                margin="normal"
            >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="success">Success/Failure</MenuItem>
                <MenuItem value="rocketName">Rocket Name</MenuItem>
            </TextField>
            {loading && <CircularProgress />}

            {error && <Typography color="error">{error}</Typography>}

            {!loading && !error && (
                currentLaunches.length !== 0 ? <div>
                    <Stack
                        direction="row"
                        flexWrap="wrap" // Enables wrapping like a grid
                        justifyContent="space-between"
                        sx={{ minHeight: '650px' }}
                    >
                        {currentLaunches.map((launch) => (
                            <Box key={launch.id} minWidth={{ xs: '100%', sm: '48%', md: '30%' }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            <Link to={`/launch/${launch.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                {launch.name}
                                            </Link>
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {new Date(launch.date_utc).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Rocket: {launch.rocketName}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Status: {launch.success ? 'Success' : 'Failure'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))}
                    </Stack>
                    {/* Pagination */}
                    <Pagination
                        count={Math.ceil(filteredLaunches.length / itemsPerPage)} // Total pages
                        page={currentPage}
                        onChange={(_, value) => handlePageChange(value)}
                        color="primary"
                        sx={{ marginTop: 2, display: 'flex', justifyContent: 'center' }}
                    />
                </div> : <Typography>No Launches Found</Typography>
            )
            }
        </div>
    )
}
