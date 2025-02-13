export const useSubcategoryFields = () => {
  const subcategoryFields = {
    103: { // ศูนย์พัฒนาเด็กเล็ก
      numberofchildren: {
        label: "จำนวนเด็ก (อายุต่ำกว่า 2 ปี)",
        type: "number",
        required: true,
        min: 0,
        placeholder: "",
      },
      babysitter: {
        label: "จำนวนพี่เลี้ยง",
        type: "number",
        required: true,
        min: 0,
        placeholder: "",
      },
      babysitter_status: {
        label: "สถานะพี่เลี้ยง",
        type: "text",
        required: true,
        placeholder: "เช่น ประจำ, พาร์ทไทม์",
      },
      roomsize: {
        label: "ขนาดห้อง",
        type: "text",
        required: true,
        placeholder: "เช่น 4x6 ตารางเมตร",
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