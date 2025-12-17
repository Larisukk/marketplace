export const COUNTY_BBOX: Record<
    string,
    { center: [number, number]; bbox: [number, number, number, number] }
> = {
    Cluj: {
        center: [46.7712, 23.6236],
        bbox: [22.5, 46.2, 24.5, 47.2],
    },
    Bucuresti: {
        center: [44.4268, 26.1025],
        bbox: [25.9, 44.3, 26.3, 44.6],
    },
    Iasi: {
        center: [47.1585, 27.6014],
        bbox: [27.2, 46.9, 28.0, 47.4],
    },
};
