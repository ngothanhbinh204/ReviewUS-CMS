import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import BlogLayout from "./layout/BlogLayout";
import BlogList from "./pages/Blog/BlogList";
import CreateBlog from "./pages/Blog/CreateBlog";
import EditBlog from "./pages/Blog/EditBlog";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import { AuthProvider } from "./context/AuthContext";
import { TenantProvider } from "./context/TenantContext";
import TenantInitializer from "./components/common/TenantInitializer";
import { QueryProvider } from "./providers/QueryProvider";
// CMS Components
import PostsList from "./components/cms/PostsList";
import PostForm from "./components/cms/PostForm";
import MediaListComponent from "./components/cms/MediaList";
import TaxonomiesList from "./components/cms/TaxonomiesList";
import CommentsList from "./components/cms/CommentsList";
import TenantsList from "./components/cms/TenantsList";

// New Post CRUD Components
import PostsPage from "./pages/PostsPage";
import PostAnalyticsPage from "./pages/PostAnalyticsPage";

// Media Management Components
import { MediaManagementPage } from "./pages/Media";

// Destinations Management Components
import DestinationList from "./components/destinations/DestinationList";
import DestinationForm from "./components/destinations/DestinationForm";

// import ViewBlog from "./pages/Blog/ViewBlog";

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <TenantProvider>
          <TenantInitializer>
            <Router>
              <ScrollToTop />
              <Routes>
            {/* Protected Dashboard Layout */}
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index path="/" element={<Home />} />

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />

              {/* Blog Routes */}
              <Route path="/blog" element={<BlogLayout />}>
                <Route index element={<BlogList />} />
                <Route path="create" element={<CreateBlog />} />
                <Route path="edit/:id" element={<EditBlog />} />
              </Route>

              {/* CMS Routes - Integrated into main layout */}
              <Route path="/cms/posts" element={<PostsList />} />
              <Route path="/cms/posts/new" element={<PostForm type="post" mode="create" />} />
              <Route path="/cms/posts/edit/:id" element={<PostForm type="post" mode="edit" />} />
              <Route path="/cms/media" element={<MediaListComponent />} />
              <Route path="/cms/categories" element={<TaxonomiesList type="category" />} />
              <Route path="/cms/tags" element={<TaxonomiesList type="tag" />} />
              <Route path="/cms/comments" element={<CommentsList />} />
              <Route path="/cms/tenants" element={<TenantsList />} />

              {/* Posts CRUD with Revision System */}
              <Route path="/posts/*" element={<PostsPage />} />
              <Route path="/posts/analytics" element={<PostAnalyticsPage />} />

              {/* Media Management System */}
              <Route path="/media/*" element={<MediaManagementPage />} />

              {/* Destinations Management */}
              <Route path="/destinations" element={<DestinationList />} />
              <Route path="/destinations/new" element={<DestinationForm />} />
              <Route path="/destinations/:id/edit" element={<DestinationForm />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>

            {/* Public Auth Routes */}
            <Route path="/signin" element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            } />

            {/* Redirect /login to /signin for backward compatibility */}
            <Route path="/login" element={<Navigate to="/signin" replace />} />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
          </TenantInitializer>
        </TenantProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
