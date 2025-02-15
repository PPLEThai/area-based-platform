export const useProvinces = () => {
  const provinces = [
    { id: "10", name: "กรุงเทพฯ", path: "bangkok" },
    { id: "71", name: "กาญจนบุรี", path: "kanchanaburi" },
    { id: "46", name: "กาฬสินธุ์", path: "kalasin" },
    { id: "62", name: "กำแพงเพชร", path: "kamphaengphet" },
    { id: "81", name: "กระบี่", path: "krabi" },
    { id: "40", name: "ขอนแก่น", path: "khonkaen" },
    { id: "22", name: "จันทบุรี", path: "chanthaburi" },
    { id: "24", name: "ฉะเชิงเทรา", path: "chachoengsao" },
    { id: "20", name: "ชลบุรี", path: "chonburi" },
    { id: "18", name: "ชัยนาท", path: "chainat" },
    { id: "36", name: "ชัยภูมิ", path: "chaiyaphum" },
    { id: "86", name: "ชุมพร", path: "chumphon" },
    { id: "57", name: "เชียงราย", path: "chiangrai" },
    { id: "50", name: "เชียงใหม่", path: "chiangmai" },
    { id: "63", name: "ตาก", path: "tak" },
    { id: "92", name: "ตรัง", path: "trang" },
    { id: "23", name: "ตราด", path: "trat" },
    { id: "26", name: "นครนายก", path: "nakhonnayok" },
    { id: "73", name: "นครปฐม", path: "nakhonpathom" },
    { id: "48", name: "นครพนม", path: "nakhonphanom" },
    { id: "30", name: "นครราชสีมา", path: "nakhonratchasima" },
    { id: "80", name: "นครศรีธรรมราช", path: "nakhonsithammarat" },
    { id: "60", name: "นครสวรรค์", path: "nakhonsawan" },
    { id: "12", name: "นนทบุรี", path: "nonthaburi" },
    { id: "96", name: "นราธิวาส", path: "narathiwat" },
    { id: "55", name: "น่าน", path: "nan" },
    { id: "38", name: "บึงกาฬ", path: "bungkan" },
    { id: "31", name: "บุรีรัมย์", path: "buriram" },
    { id: "13", name: "ปทุมธานี", path: "pathumthani" },
    { id: "77", name: "ประจวบคีรีขันธ์", path: "prachuapkhirikhan" },
    { id: "25", name: "ปราจีนบุรี", path: "prachinburi" },
    { id: "94", name: "ปัตตานี", path: "pattani" },
    { id: "14", name: "พระนครศรีอยุธยา", path: "ayutthaya" },
    { id: "82", name: "พังงา", path: "phangnga" },
    { id: "93", name: "พัทลุง", path: "phatthalung" },
    { id: "56", name: "พะเยา", path: "phayao" },
    { id: "66", name: "พิจิตร", path: "phichit" },
    { id: "65", name: "พิษณุโลก", path: "phitsanulok" },
    { id: "76", name: "เพชรบุรี", path: "phetchaburi" },
    { id: "67", name: "เพชรบูรณ์", path: "phetchabun" },
    { id: "54", name: "แพร่", path: "phrae" },
    { id: "83", name: "ภูเก็ต", path: "phuket" },
    { id: "44", name: "มหาสารคาม", path: "mahasarakham" },
    { id: "49", name: "มุกดาหาร", path: "mukdahan" },
    { id: "58", name: "แม่ฮ่องสอน", path: "maehongson" },
    { id: "35", name: "ยโสธร", path: "yasothon" },
    { id: "95", name: "ยะลา", path: "yala" },
    { id: "45", name: "ร้อยเอ็ด", path: "roiet" },
    { id: "85", name: "ระนอง", path: "ranong" },
    { id: "21", name: "ระยอง", path: "rayong" },
    { id: "70", name: "ราชบุรี", path: "ratchaburi" },
    { id: "16", name: "ลพบุรี", path: "lopburi" },
    { id: "52", name: "ลำปาง", path: "lampang" },
    { id: "51", name: "ลำพูน", path: "lamphun" },
    { id: "42", name: "เลย", path: "loei" },
    { id: "33", name: "ศรีสะเกษ", path: "sisaket" },
    { id: "47", name: "สกลนคร", path: "sakonnakhon" },
    { id: "27", name: "สระแก้ว", path: "sakaeo" },
    { id: "19", name: "สระบุรี", path: "saraburi" },
    { id: "91", name: "สตูล", path: "satun" },
    { id: "17", name: "สิงห์บุรี", path: "singburi" },
    { id: "90", name: "สงขลา", path: "songkhla" },
    { id: "11", name: "สมุทรปราการ", path: "samutprakan" },
    { id: "75", name: "สมุทรสงคราม", path: "samutsongkhram" },
    { id: "74", name: "สมุทรสาคร", path: "samutsakhon" },
    { id: "64", name: "สุโขทัย", path: "sukhothai" },
    { id: "72", name: "สุพรรณบุรี", path: "suphanburi" },
    { id: "84", name: "สุราษฎร์ธานี", path: "suratthani" },
    { id: "32", name: "สุรินทร์", path: "surin" },
    { id: "43", name: "หนองคาย", path: "nongkhai" },
    { id: "39", name: "หนองบัวลำภู", path: "nongbualamphu" },
    { id: "37", name: "อำนาจเจริญ", path: "amnatcharoen" },
    { id: "15", name: "อ่างทอง", path: "angthong" },
    { id: "41", name: "อุดรธานี", path: "udonthani" },
    { id: "53", name: "อุตรดิตถ์", path: "uttaradit" },
    { id: "61", name: "อุทัยธานี", path: "uthaithani" },
    { id: "34", name: "อุบลราชธานี", path: "ubonratchathani" }
  ];

  const getProvinceId = (path) => {
    const province = provinces.find(p => p.path === path);
    return province?.id || "10";
  };

  const getProvincePath = (id) => {
    const province = provinces.find(p => p.id === id);
    return province?.path || "bangkok";
  };

  return {
    provinces,
    getProvinceId,
    getProvincePath
  };
}; 