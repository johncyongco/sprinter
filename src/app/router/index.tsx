import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { AppLayout } from "@/app/layouts/AppLayout";
import { ErrorPage } from "@/app/providers/ErrorPage";

type Loader = () => Promise<{ default: ComponentType<Record<string, never>> }>;

function lazyPage(loader: Loader): LazyExoticComponent<ComponentType<Record<string, never>>> {
  return lazy(loader);
}

const HomePage = lazyPage(() => import("@/features/stories/HomePage"));
const ExplorePage = lazyPage(() => import("@/features/stories/ExplorePage"));
const ExploreSectionPage = lazyPage(() => import("@/features/stories/ExploreSectionPage"));
const StoryDetailPage = lazyPage(() => import("@/features/stories/StoryDetailPage"));
const StartStoryPage = lazyPage(() => import("@/features/stories/StartStoryPage"));
const WriteAnythingPage = lazyPage(() => import("@/features/stories/WriteAnythingPage"));
const ContinuePage = lazyPage(() => import("@/features/stories/ContinuePage"));
const WordVaultPage = lazyPage(() => import("@/features/words/WordVaultPage"));
const WordDetailPage = lazyPage(() => import("@/features/words/WordDetailPage"));
const CritiquePage = lazyPage(() => import("@/features/critiques/CritiquePage"));
const ChallengesPage = lazyPage(() => import("@/features/challenges/ChallengesPage"));
const ChallengeDetailPage = lazyPage(() => import("@/features/challenges/ChallengeDetailPage"));
const AnthologiesPage = lazyPage(() => import("@/features/anthologies/AnthologiesPage"));
const AnthologyDetailPage = lazyPage(() => import("@/features/anthologies/AnthologyDetailPage"));
const CollectionsPage = lazyPage(() => import("@/features/collections/CollectionsPage"));
const CommunitiesPage = lazyPage(() => import("@/features/communities/CommunitiesPage"));
const CommunityDetailPage = lazyPage(() => import("@/features/communities/CommunityDetailPage"));
const NotificationsPage = lazyPage(() => import("@/features/notifications/NotificationsPage"));
const ProfilePage = lazyPage(() => import("@/features/profile/ProfilePage"));
const SettingsPage = lazyPage(() => import("@/features/profile/SettingsPage"));
const SearchPage = lazyPage(() => import("@/features/search/SearchPage"));
const OnboardingPage = lazyPage(() => import("@/features/auth/OnboardingPage"));
const NotFoundPage = lazyPage(() => import("@/features/NotFoundPage"));

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "explore", element: <ExplorePage /> },
      { path: "explore/:section", element: <ExploreSectionPage /> },
      { path: "words", element: <WordVaultPage /> },
      { path: "words/:wordId", element: <WordDetailPage /> },
      { path: "stories/:slug", element: <StoryDetailPage /> },
      { path: "write", element: <StartStoryPage /> },
      { path: "write/anything", element: <WriteAnythingPage /> },
      { path: "stories/:slug/continue", element: <ContinuePage /> },
      { path: "stories/:slug/critique", element: <CritiquePage /> },
      { path: "challenges", element: <ChallengesPage /> },
      { path: "challenges/:challengeId", element: <ChallengeDetailPage /> },
      { path: "anthologies", element: <AnthologiesPage /> },
      { path: "anthologies/:anthologyId", element: <AnthologyDetailPage /> },
      { path: "collections", element: <CollectionsPage /> },
      { path: "communities", element: <CommunitiesPage /> },
      { path: "communities/:communityId", element: <CommunityDetailPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "onboarding",
    element: <OnboardingPage />,
  },
  {
    path: "signout",
    element: <Navigate to="/" replace />,
  },
]);
