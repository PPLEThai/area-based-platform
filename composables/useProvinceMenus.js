import { markRaw } from "vue";
import SvgAddPin from "@/components/Svg/SvgAddPin.vue";
import SvgTable from "@/components/Svg/SvgTable.vue";
import SvgMap from "@/components/Svg/SvgMap.vue";
import SvgMarker from "@/components/Svg/SvgMarker.vue";

export const useProvinceMenus = () => {
  // เมนูพื้นฐานที่ทุกจังหวัดมี
  const defaultMenus = (path, cityName) => [
    {
      id: `${path}-location`,
      name: "บันทึก",
      role: "location",
      path: `/${path}`,
      icon: markRaw(SvgAddPin),
      city: path,
      cityName: cityName
    },
    {
      id: `${path}-items`,
      name: "รายการ",
      role: "items",
      path: `/${path}/items`,
      icon: markRaw(SvgTable),
      city: path,
      cityName: cityName
    },
    {
      id: `${path}-map`,
      name: "แผนที่",
      role: "map",
      path: `/${path}/map`,
      icon: markRaw(SvgMap),
      city: path,
      cityName: cityName
    }
  ];

  // เมนูพิเศษสำหรับบางจังหวัด
  const specialMenus = {
    bangkok: [
      {
        id: "bangkok-fondue",
        name: "Fondue",
        role: "fondue",
        path: "/bangkok/fondue",
        icon: markRaw(SvgMarker),
        city: "bangkok",
        cityName: "กรุงเทพฯ"
      }
    ],
    // เพิ่มเมนูพิเศษสำหรับจังหวัดอื่นๆ ได้ที่นี่
    chiangmai: [
      {
        id: "chiangmai-special",
        name: "พิเศษ",
        role: "special",
        path: "/chiangmai/special",
        icon: markRaw(SvgMarker),
        city: "chiangmai",
        cityName: "เชียงใหม่"
      }
    ],
    lamphun: [
      {
        id: "lamphun-special",
        name: "City Data",
        role: "special",
        path: "/lamphun/citydata",
        icon: markRaw(SvgMap),
        city: "lamphun",
        cityName: "ลำพูน"
      }
    ]
  };

  const getProvinceMenus = (path, cityName) => {
    const menus = defaultMenus(path, cityName);
    if (specialMenus[path]) {
      return [...menus, ...specialMenus[path]];
    }
    return menus;
  };

  return {
    getProvinceMenus
  };
}; 