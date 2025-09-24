import { useParams } from "react-router-dom";
export default function EditBlog() {
  const { id } = useParams();
  return <div>Chỉnh sửa blog có ID: {id}</div>;
}