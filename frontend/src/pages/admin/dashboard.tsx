import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Layout, Menu, Typography, Card, Statistic } from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  ScheduleOutlined,
  ShoppingCartOutlined,
  HomeOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate("/login");
    }
  }, [user, isAdmin, navigate]);

  const menuItems = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: "Trang chủ",
      onClick: () => navigate("/admin"),
    },
    {
      key: "2",
      icon: <VideoCameraOutlined />,
      label: "Quản lý Phim",
      onClick: () => navigate("/admin/movies"),
    },
    {
      key: "3",
      icon: <ScheduleOutlined />,
      label: "Quản lý Lịch chiếu",
      onClick: () => navigate("/admin/showtimes"),
    },
    {
      key: "4",
      icon: <UserOutlined />,
      label: "Quản lý Người dùng",
      onClick: () => navigate("/admin/users"),
    },
    {
      key: "5",
      icon: <ShoppingCartOutlined />,
      label: "Quản lý Đặt vé",
      onClick: () => navigate("/admin/bookings"),
    },
  ];

  return (
    <div className="min-h-screen w-full max-w-[1600px] mx-auto">
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          theme="dark"
          className="fixed h-screen z-10 left-0"
        >
          <div className="text-white text-center py-4">
            <Title level={4} className="text-white m-0">
              MY CINEMA
            </Title>
          </div>
          <Menu
            theme="dark"
            defaultSelectedKeys={["1"]}
            mode="inline"
            items={menuItems}
          />
        </Sider>

        <Layout
          className={`transition-all duration-200 ${
            collapsed ? "ml-20" : "ml-[200px]"
          }`}
        >
          <Header className="p-0 bg-white sticky top-0 z-9 w-full shadow">
            <div className="px-4">
              <Title level={3}>Bảng điều khiển Admin</Title>
            </div>
          </Header>

          <Content className="m-4 p-6 bg-white rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Card>
                  <Statistic
                    title="Tổng số phim"
                    value={20}
                    prefix={<VideoCameraOutlined />}
                  />
                </Card>
              </div>
              <div>
                <Card>
                  <Statistic
                    title="Tổng số người dùng"
                    value={150}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </div>
              <div>
                <Card>
                  <Statistic
                    title="Lịch chiếu hôm nay"
                    value={8}
                    prefix={<ScheduleOutlined />}
                  />
                </Card>
              </div>
              <div>
                <Card>
                  <Statistic
                    title="Đặt vé hôm nay"
                    value={45}
                    prefix={<ShoppingCartOutlined />}
                  />
                </Card>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default Dashboard;
