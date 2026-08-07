import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/app/layouts/AppLayout";
import { ErrorPage } from "@/app/providers/ErrorPage";
import HomePage from "@/features/stories/HomePage";
import ExplorePage from "@/features/stories/ExplorePage";
import ExploreSectionPage from "@/features/stories/ExploreSectionPage";
import StoryDetailPage from "@/features/stories/StoryDetailPage";
import StartStoryPage from "@/features/stories/StartStoryPage";
import WriteAnythingPage from "@/features/stories/WriteAnythingPage";
import ContinuePage from "@/features/stories/ContinuePage";
import WordVaultPage from "@/features/words/WordVaultPage";
import WordDetailPage from "@/features/words/WordDetailPage";
import CritiquePage from "@/features/critiques/CritiquePage";
import ChallengesPage from "@/features/challenges/ChallengesPage";
import ChallengeDetailPage from "@/features/challenges/ChallengeDetailPage";
import AnthologiesPage from "@/features/anthologies/AnthologiesPage";
import AnthologyDetailPage from "@/features/anthologies/AnthologyDetailPage";
import CollectionsPage from "@/features/collections/CollectionsPage";
import CommunitiesPage from "@/features/communities/CommunitiesPage";
import CommunityDetailPage from "@/features/communities/CommunityDetailPage";
import NotificationsPage from "@/features/notifications/NotificationsPage";
import ProfilePage from "@/features/profile/ProfilePage";
import SavedStoriesPage from "@/features/profile/SavedStoriesPage";
import SettingsPage from "@/features/profile/SettingsPage";
import SearchPage from "@/features/search/SearchPage";
import OnboardingPage from "@/features/auth/OnboardingPage";
import LoginPage from "@/features/auth/LoginPage";
import NotFoundPage from "@/features/NotFoundPage";

function AuthCallback() {
  return (
    <div className="min-h-screen bg-background grid place-items-center text-secondary text-sm">
      Completing sign-in…
    </div>
  );
}

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
      { path: "profile/stories", element: <SavedStoriesPage /> },
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
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "auth/v1/callback",
    element: <AuthCallback />,
  },
  {
    path: "signout",
    element: <Navigate to="/" replace />,
  },
]);
