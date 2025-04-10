import axiosInstance from "./axiosInstance";

export interface Promotion {
  id: number;
  name: string;
  description: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  status: string;
  code: string;
}

// Lấy danh sách khuyến mãi cho user
export const getPromotions = async (): Promise<Promotion[]> => {
  try {
    const response = await axiosInstance.get("/promotions");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
    throw new Error("Không thể lấy danh sách khuyến mãi");
  }
};

// Lấy chi tiết khuyến mãi theo ID
export const getPromotionById = async (id: number): Promise<Promotion> => {
  try {
    const response = await axiosInstance.get(`/promotions/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết khuyến mãi:", error);
    throw new Error("Không thể lấy chi tiết khuyến mãi");
  }
};

// Tạo khuyến mãi mới (Admin only)
export const createPromotion = async (promotionData: Omit<Promotion, "id">): Promise<Promotion> => {
  try {
    const response = await axiosInstance.post("/promotions", promotionData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo khuyến mãi:", error);
    throw new Error("Không thể tạo khuyến mãi mới");
  }
};

// Cập nhật khuyến mãi (Admin only)
export const updatePromotion = async (
  id: number,
  promotionData: Partial<Promotion>
): Promise<Promotion> => {
  try {
    const response = await axiosInstance.put(`/promotions/${id}`, promotionData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật khuyến mãi:", error);
    throw new Error("Không thể cập nhật khuyến mãi");
  }
};

// Xóa khuyến mãi (Admin only)
export const deletePromotion = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/promotions/${id}`);
  } catch (error) {
    console.error("Lỗi khi xóa khuyến mãi:", error);
    throw new Error("Không thể xóa khuyến mãi");
  }
};

// Kiểm tra mã khuyến mãi có hợp lệ không
export const validatePromotionCode = async (code: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.post("/promotions/validate", { code });
    return response.data.valid;
  } catch (error) {
    console.error("Lỗi khi kiểm tra mã khuyến mãi:", error);
    throw new Error("Không thể kiểm tra mã khuyến mãi");
  }
};
