import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Survey Campaigns | NCSKit',
  description: 'Create and manage survey campaigns with participant targeting and token rewards',
};

export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
