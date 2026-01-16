import UserDetail from "@/components/admin/UserDetail";

// 1. Cập nhật Type: params là một Promise
interface PageProps {
  params: Promise<{ id: string }>;
}

// 2. Thêm 'async' vào function component
export default async function Page({ params }: PageProps) {
  
  // 3. Phải 'await' params để lấy dữ liệu ra trước khi sử dụng
  const { id } = await params;

  // Bây giờ id đã là chuỗi string bình thường
  return <UserDetail userId={id} />;
}