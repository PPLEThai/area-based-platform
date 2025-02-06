export const useProvinceId = () => {
  const pathToProvinceId = {
    bangkok: "10",
    samutprakan: "11",
    nonthaburi: "12",
    pathumthani: "13",
    ayutthaya: "14",
    angthong: "15",
    lopburi: "16",
    singburi: "17",
    chainat: "18",
    saraburi: "19",
    chonburi: "20",
    rayong: "21",
    chanthaburi: "22",
    trat: "23",
    chachoengsao: "24",
    prachinburi: "25",
    nakhonnayok: "26",
    sakaeo: "27",
    nakhonratchasima: "30",
    buriram: "31",
    surin: "32",
    sisaket: "33",
    ubonratchathani: "34",
    yasothon: "35",
    chaiyaphum: "36",
    amnatcharoen: "37",
    bungkan: "38",
    nongbualamphu: "39",
    khonkaen: "40",
    udonthani: "41",
    loei: "42",
    nongkhai: "43",
    mahatat: "44",
    roiet: "45",
    kalasin: "46",
    sakonnakhon: "47",
    nakhonphanom: "48",
    mukdahan: "49",
    chiangmai: "50",
    lamphun: "51",
    lampang: "52",
    uttaradit: "53",
    phrae: "54",
    nan: "55",
    phayao: "56",
    chiangrai: "57",
    maehongson: "58",
    nakhonsawan: "60",
    uthaithani: "61",
    kamphaengphet: "62",
    phitsanulok: "63",
    phichit: "64",
    phrae: "54",
    nan: "55",
    phayao: "56",
    phitsanukul: "65",
    // ... (เพิ่มจังหวัดอื่นๆ ตามที่มีใน index.vue)
  };

  const getProvinceId = (path) => {
    return pathToProvinceId[path] || "10"; // default to bangkok if not found
  };

  return {
    getProvinceId
  };
}; 