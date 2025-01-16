import bkkBoundaryData from '@/assets/data/bangkok_area.json';
import bkkDistrictBoundaryDta from '@/assets/data/district_minify.json';

export function useBkkBoundary() {
    const getBkkBoundaryData = () => {
        return bkkBoundaryData;
    };

    return {
        getBkkBoundaryData,
    };
}

export function useBkkDistrictBoundary() {
    const getBkkDistrictBoundaryData = () => {
        return bkkDistrictBoundaryDta;
    };

    return {
        getBkkDistrictBoundaryData,
    };
}