import Notes from './Notes'

export const Home = (props) => {
  return (
    <div>
      <Notes 
        showAlert={props.showAlert}
        search={props.search}
        searchType={props.searchType}
      />
    </div>
  )
}

export default Home