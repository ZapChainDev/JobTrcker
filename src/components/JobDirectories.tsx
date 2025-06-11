import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface JobDirectory {
  name: string;
  url: string;
  description: string;
}

const globalPlatforms: JobDirectory[] = [
  { name: 'Fiverr', url: 'https://www.fiverr.com/', description: 'Gig-based, no connects required.' },
  { name: 'Freelancer', url: 'https://www.freelancer.com/', description: 'Has free connects/month, project bidding.' },
  { name: 'PeoplePerHour', url: 'https://www.peopleperhour.com/', description: 'Proposal-based, some free credits monthly.' },
  { name: 'Guru', url: 'https://www.guru.com/', description: 'Workroom-style freelance site.' },
  { name: 'Truelancer', url: 'https://www.truelancer.com/', description: 'Popular in Asia; no subscription needed to start.' },
  { name: 'FreeeUp', url: 'https://freeeup.com', description: 'Pre-vetted freelancers, fast hiring.' },
  { name: 'GoLance', url: 'https://golance.com/', description: 'Lower fees, PayPal-friendly.' },
  { name: 'Toptal', url: 'https://www.toptal.com/', description: 'Elite talent pool; strict screening.' },
  { name: 'SolidGigs', url: 'https://solidgigs.com/', description: 'Curated freelance job list; monthly fee.' },
  { name: 'Workana', url: 'https://www.workana.com/', description: 'Popular in Latin America, global reach.' },
  { name: 'Crowded', url: 'https://www.crowded.com/', description: 'Job aggregator that pulls from multiple sites.' },
];

const phPlatforms: JobDirectory[] = [
  { name: 'OnlineJobs PH', url: 'https://www.onlinejobs.ph/', description: 'Specifically for Filipino VAs and remote workers.' },
  { name: 'RemoteWork PH', url: 'https://remotework.ph/', description: 'Job board for PH-based online work.' },
  { name: '199Jobs', url: 'https://199jobs.com/', description: 'Microjobs platform in PHP currency.' },
  { name: 'VirtualStaff.ph', url: 'https://www.virtualstaff.ph/', description: 'For full-time and part-time online jobs for Filipinos.' },
];

const remoteJobBoards: JobDirectory[] = [
  { name: 'Outsourcely', url: 'https://www.outsourcely.com/', description: 'Remote hiring platform for startups.' },
  { name: 'We Work Remotely', url: 'https://weworkremotely.com/', description: 'Job board for developers, marketers, and VAs.' },
  { name: 'Remote OK', url: 'https://remoteok.com/', description: 'Curated jobs for digital nomads.' },
  { name: 'AngelList Talent (Wellfound)', url: 'https://wellfound.com/', description: 'Freelance gigs at startups.' },
  { name: 'FlexJobs', url: 'https://www.flexjobs.com/', description: 'Verified remote/flexible jobs (paid access).' },
];

const nicheSites: JobDirectory[] = [
  { name: 'Zeerk', url: 'https://zeerk.com/', description: 'Microjobs similar to Fiverr.' },
  { name: 'Kolabtree', url: 'https://www.kolabtree.com/', description: 'Freelance science & research experts.' },
  { name: 'DesignCrowd', url: 'https://www.designcrowd.com/', description: 'For graphic designers – contest-based.' },
  { name: 'CloudPeeps', url: 'https://www.cloudpeeps.com/', description: 'Marketing and content-focused freelancers.' },
  { name: 'Hireable', url: 'https://hireable.com/', description: 'Simple freelance job search engine.' },
];

export function JobDirectories() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Job Directories</h2>
      <Tabs defaultValue="global" className="w-full">
        <TabsList className="flex justify-start gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800 w-full overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="global" className="flex-none">Global Platforms</TabsTrigger>
          <TabsTrigger value="ph" className="flex-none">PH Platforms</TabsTrigger>
          <TabsTrigger value="remote" className="flex-none">Remote Jobs</TabsTrigger>
          <TabsTrigger value="niche" className="flex-none">Niche Sites</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {globalPlatforms.map((platform) => (
              <Card key={platform.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <a href={platform.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      {platform.name}
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{platform.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ph" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {phPlatforms.map((platform) => (
              <Card key={platform.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <a href={platform.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      {platform.name}
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{platform.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="remote" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {remoteJobBoards.map((platform) => (
              <Card key={platform.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <a href={platform.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      {platform.name}
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{platform.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="niche" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nicheSites.map((platform) => (
              <Card key={platform.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <a href={platform.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      {platform.name}
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{platform.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 