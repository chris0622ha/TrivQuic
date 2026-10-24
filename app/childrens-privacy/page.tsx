import Legal from '../legal-shared';
export const metadata = { title: "Children's Privacy — TrivQuic" };
export default function ChildrensPrivacyPage() {
  return <Legal title="Children's Privacy"
    intro="This page is for parents and guardians. TrivQuic does not knowingly collect personal information from children under 13."
    sections={[
      { h:'1. How we treat under-13 players', ul:[
        'Players who say they are under 13 (or skip the age check) can play quizzes without an account.',
        'They cannot sign in, enter a name, join leaderboards, add friends, or play duels or multiplayer.',
        'Their name is always shown as "Player" and we do not store any personal information about them.',
        'No ads, no behavioral tracking, no analytics trackers, and no sharing of information with third parties.',
      ] },
      { h:'2. What stays on the device', p:['The age-check answer and quiz settings are kept in the browser on that device. Clearing browser data removes them.'] },
      { h:'3. Why no parental consent flow', p:['Because we collect no personal information from children, there is nothing to ask a parent to approve. If that ever changes, we will first add verifiable parental consent as COPPA requires.'] },
      { h:'4. If a child gets an account anyway', p:['If you believe a child under 13 signed in or sent us information, email us and we will delete it promptly.'] },
      { h:'5. Retention and sharing', p:['We keep no children\'s personal information. For how long we keep data about older players, and who receives it, see the Privacy Policy.'] },
    ]} />;
}
