import GoalPage from "./_components/GoalPage"


const Page = async ({params}: {params: Promise<{id: string}>}) => {
  const id = (await params).id;

  return (
    <GoalPage id={id} />
  )
}

export default Page