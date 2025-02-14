export const useSubcategoryFields = () => {
  const subcategoryFields = {
    103: { // ศูนย์พัฒนาเด็กเล็ก
      total_children: {
        label: "จำนวนเด็กในศพด. (คน)",
        type: "number", 
        required: true,
        min: 0,
        placeholder: "",
      },
      children_under_two: {
        label: "จำนวนเด็กในศพด. < 2 ขวบ (คน)",
        type: "number",
        required: true,
        min: 0,
        placeholder: "",
      },
      caretakers: {
        label: "จำนวนครูพี่เลี้ยง (คน)",
        type: "number",
        required: true,
        min: 0,
        placeholder: "",
      },
      rooms: {
        label: "จำนวนห้องดูแลเด็ก (ห้อง)",
        type: "number",
        required: true,
        min: 0,
        placeholder: "",
      },
      location_type: {
        label: "ประเภทสถานที่ตั้งศพด.",
        type: "text",
        required: true,
        placeholder: "เช่น เอกชน / วัด / กทม / ที่ราชพัสดุ /หน่วยงานราชการ / อื่นๆ",
      },
      survey_date: {
        label: "วันที่สำรวจ",
        type: "date",
        required: true,
        placeholder: "",
      },
      caretaker_feedback: {
        label: "ความคิดเห็นของครูพี่เลี้ยงสำหรับพัฒนาห้องปลอดฝุ่น",
        type: "longtext",
        required: true,
        placeholder: "",
      },
      surveyor_feedback: {
        label: "ความคิดเห็นของผู้สำรวจสำหรับพัฒนาห้องปลอดฝุ่น", 
        type: "longtext",
        required: true,
        placeholder: "",
      },
      building_feedback: {
        label: "ความคิดเห็นต่อสภาพอาคาร, คุรุภัณฑ์ ที่ต้องการปรับปรุงเพิ่มเติม",
        type: "longtext",
        required: true,
        placeholder: "",
      },
    }
    // เพิ่มประเภทอื่นๆ ได้ที่นี่
  };

  // สร้าง default values สำหรับแต่ละประเภท
  const getDefaultValues = (subcategoryId) => {
    const fields = subcategoryFields[subcategoryId];
    if (!fields) return {};

    return Object.keys(fields).reduce((acc, key) => {
      const field = fields[key];
      acc[key] = field.type === 'number' ? 0 : '';
      return acc;
    }, {});
  };

  // ตรวจสอบความถูกต้องของข้อมูล
  const validateFields = (subcategoryId, values) => {
    const fields = subcategoryFields[subcategoryId];
    if (!fields) return { isValid: true, errors: {} };

    const errors = {};
    let isValid = true;

    Object.keys(fields).forEach(key => {
      const field = fields[key];
      const value = values[key];

      if (field.required && (value === null || value === undefined || value === '')) {
        errors[key] = `กรุณากรอก${field.label}`;
        isValid = false;
      }

      if (field.type === 'number' && field.min !== undefined && value < field.min) {
        errors[key] = `${field.label}ต้องมีค่ามากกว่าหรือเท่ากับ ${field.min}`;
        isValid = false;
      }
    });

    return { isValid, errors };
  };

  return {
    subcategoryFields,
    getDefaultValues,
    validateFields,
  };
}; 