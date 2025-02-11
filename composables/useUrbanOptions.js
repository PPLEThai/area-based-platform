export const useUrbanOptions = () => {
  const ownershipList = [
    { id: 1, name: "ท้องถิ่น" },
    { id: 2, name: "หน่วยงานอื่น" },
    { id: 3, name: "เอกชน" },
    { id: 4, name: "ไม่ทราบ" },
  ];

  const stakeholderList = [
    { id: 1, name: "ประชาชนทั่วไป" },
    { id: 2, name: "แม่ค้า" },
    { id: 3, name: "ข้าราชการ" },
    { id: 4, name: "ผู้ใช้รถใช้ถนน" },
    { id: 5, name: "บริษัทพัฒนาเมือง" },
    { id: 6, name: "startup" },
    { id: 7, name: "ผู้ประกอบการทางสังคม" },
    { id: 8, name: "กลุ่มประชาสังคม" },
    { id: 9, name: "NGOs มูลนิธิ" },
    { id: 10, name: "ผู้ประกอบการเอกชนที่เกี่ยวข้อง" },
    { id: 11, name: "อื่นๆ" },
  ];

  return {
    ownershipList,
    stakeholderList,
  };
};