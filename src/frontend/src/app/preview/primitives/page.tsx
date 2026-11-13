import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, statusTones } from "@/components/ui/badge";

export default function PrimitivePreview() {
  const labels: Record<keyof typeof statusTones, string> = {
    active: "Đang thực hiện",
    ready: "Sẵn sàng",
    done: "Hoàn tất",
    waiting: "Chờ duyệt",
    blocked: "Bị chặn",
    failed: "Thất bại",
    overdue: "Quá hạn",
    locked: "Đang khóa",
    disabled: "Vô hiệu",
    neutral: "Chưa bắt đầu",
  };
  return (
    <main className="primitive-preview">
      <h1>Thành phần giao diện</h1>
      <p>FE-02.01 · Mac/Teal · DEMO</p>
      <section>
        <h2>Nút thao tác</h2>
        <div className="primitive-row">
          <Button>Lưu thay đổi</Button>
          <Button disabled>Chưa khả dụng</Button>
          <Button>
            Thêm yêu cầu phối hợp giữa các phòng ban trong khung giờ làm việc
          </Button>
        </div>
      </section>
      <section>
        <h2>Trường nhập liệu</h2>
        <div className="primitive-fields">
          <Input label="Tên hiển thị" placeholder="Nhập tên của bạn" required />
          <Input
            label="Email"
            type="email"
            defaultValue="khong-hop-le"
            error="Nhập địa chỉ email đúng định dạng."
          />
          <Input label="Mã tham chiếu" readOnly defaultValue="DEMO-001" />
          <Input label="Trường bị khóa" disabled />
        </div>
      </section>
      <section>
        <h2>Trạng thái nghiệp vụ</h2>
        <div className="primitive-row">
          {(Object.keys(labels) as (keyof typeof labels)[]).map((status) => (
            <Badge key={status} status={status}>
              {labels[status]}
            </Badge>
          ))}
        </div>
      </section>
    </main>
  );
}
