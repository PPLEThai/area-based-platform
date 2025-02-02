import bkkBoundaryData from '@/assets/data/bangkok_area.json';
import lamphunBoundaryData from '@/assets/data/lamphun_province.json';
import bkkDistrictBoundaryDta from '@/assets/data/district_minify.json';
import lamphunDistrictBoundaryDta from '@/assets/data/lamphun_district.json';
import lamphunSubDistrictBoundaryDta from '@/assets/data/lamphun_subdistrict.json';

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

export function useLamphunBoundary() {
    const getLamphunBoundaryData = () => {
        return lamphunBoundaryData;
    };

    const getLamphunDistrictBoundaryData = () => {
        return lamphunDistrictBoundaryDta;
    };

    const getLamphunSubDistrictBoundaryData = () => {
        return lamphunSubDistrictBoundaryDta;
    };

    return {
        getLamphunBoundaryData,
        getLamphunDistrictBoundaryData,
        getLamphunSubDistrictBoundaryData,
    };
}

export function useLamphunDistrictBoundary() {
    const getLamphunDistrictBoundaryData = () => {
        return lamphunDistrictBoundaryDta;
    };

    return {
        getLamphunDistrictBoundaryData,
    };
}