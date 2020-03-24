import React from 'react';
import axios from 'axios';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import './App.css';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';


const DEFAULT_QUERY = "redux";
const DEFAULT_HPP = "100" ;

const PATH_BASE = "https://hn.algolia.com/api/v1";
const PATH_SEARCH = "/search";
const PARAM_SEARCH = "query=";
const PARAM_PAGE = "page=";
const PARAM_HPP = "hitsPerPage=";

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};

const updateSearchTopStoriesState = (hits, page) =>  (prevState) => {
  const { searchKey, results } = prevState;
  const oldHits = results && results[searchKey]
  ? results[searchKey].hits
  : [];
  const updatedHits = [
  ...oldHits,
  ...hits
  ];
  return {
    results: {
      ...results,
      [searchKey]: { hits: updatedHits, page }
    },
    isLoading: false
  };
};
  

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
    };
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
  }

  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({ isLoading: true })

    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
    .then(result => this.setSearchTopStories(result.data))
    .catch(error => this.setState({ error }));
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }
 
  setSearchTopStories(result) {
    const { hits, page } = result;

    this.setState(updateSearchTopStoriesState(hits, page));
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });

    if(this.needsToSearchTopStories(searchTerm)){
      this.fetchSearchTopStories(searchTerm);
    };
    
    event.preventDefault();
  }

  componentDidMount() {
    const {searchTerm} = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  onDismiss(id) {
    const {results, searchKey} = this.state;
    const {hits, page} = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);

    this.setState({
      results: {
        ...results,
        [searchKey]: {hits: updatedHits, page}
      }
    });
  }

  onSearchChange(event) {
    this.setState({
      searchTerm: event.target.value
    })
  }


  render(){
    const {searchTerm, results, searchKey, error, isLoading, sortKey, isSortReversed} = this.state;
    const page = ( results && results[searchKey] && results[searchKey].page ) || 0;
    const list = ( results && results[searchKey] && results[searchKey].hits ) || [];

    return (
      <div className="page">
      <div className="interactions">
        <Search 
          value={searchTerm}
          onChange={this.onSearchChange}
          onSubmit={this.onSearchSubmit}
        >
          Search
        </Search>
      </div>
        { error 
          ? <div className="interactions">
              <p>Something went wrong.</p>
            </div> 
          : <Table 
            list={list}
            onDismiss={this.onDismiss}
            /> 
        } 
         <div className="interactions">
            <ButtonWithLoading 
              isLoading={isLoading}
              onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
                More
            </ButtonWithLoading>
           
         </div>  
      </div>
    );
  }
}

class Search extends React.Component {
  componentDidMount() {
    if(this.inputt) {
      this.inputt.focus();
    }
  }

  render () {
    const {
      value,
      onChange,
      onSubmit,
      children,
    } = this.props;

    return (
      <form onSubmit={onSubmit}>
        <input
          type='text'
          value={value} 
          onChange={onChange}
          ref={elem => this.inputt = elem}
        />
        <button type='submit'>
          {children}
        </button>
      </form>
    );
    }
}

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortKey: 'NONE',
      isSortReversed: false,
    }
    this.onSort = this.onSort.bind(this);
  }
  
  onSort(sortKey) {
    const isSortReversed = sortKey === this.state.sortKey && !this.state.isSortReversed;
    this.setState({ sortKey, isSortReversed });
  }

  render() {
    const {list, onDismiss} = this.props;
    const {sortKey, isSortReversed} = this.state;

    const SortedList = isSortReversed
      ? SORTS[sortKey](list).reverse()
      : SORTS[sortKey](list);

    const largeColumn = {
      width: '40%'
    };
    const midColumn = {
      width: '30%'
    };
    const smallColumn = {
      width: '10%'
    };

    return(
      <div className="table">
      <div className="table-header">
        <span style={largeColumn}>
          <Sort 
            sortKey={'TITLE'}
            onSort={this.onSort}
            activeSortKey={sortKey}
            isSortReversed={isSortReversed}
          >
            Title
          </Sort>
        </span>
        <span style={midColumn}>
          <Sort
            sortKey={'AUTHOR'}
            onSort={this.onSort}
            activeSortKey={sortKey}
            isSortReversed={isSortReversed}
          >
            Author
          </Sort>
        </span>
        <span style={smallColumn}>
          <Sort
            sortKey={'COMMENTS'}
            onSort={this.onSort}
            activeSortKey={sortKey}
            isSortReversed={isSortReversed}
          >
            Comments
          </Sort>
        </span>
        <span style={smallColumn}>
          <Sort
            sortKey={'POINTS'}
            onSort={this.onSort}
            activeSortKey={sortKey}
            isSortReversed={isSortReversed}
          >
            Points
          </Sort>
        </span>
        <span style={smallColumn}>
          Archive
        </span>
      </div>
      {SortedList.map(item =>
        <div key={item.objectID} className="table-row">
         <span style={largeColumn}>
           <a href={item.url}>{item.title}</a>
         </span>
         <span style={midColumn}>{item.author}</span>
         <span style={smallColumn}>{item.num_comments}</span>
         <span style={smallColumn}>{item.points}</span>
         <span style={smallColumn}>
           <Button 
             onClick={() => onDismiss(item.objectID)}
             className="button-inline"
            >
               Dismiss
           </Button>
         </span>
       </div>
   )}
      </div> 
      )
  }
}



const Button = ({onClick, className , children}) => 
      <button
        className={className}
        onClick={onClick}
        type='button'
      >
        {children}
      </button>

const Sort = ({sortKey, onSort, children, activeSortKey, isSortReversed }) => {
    const sortClass = classNames(
      'button-inline',
      {'button-active' : sortKey === activeSortKey }
    );

    return (
      <Button
        onClick={() => onSort(sortKey)}
        className={sortClass}
      >
        {children}
        <Arrow 
          sortKey={sortKey}
          activeSortKey={activeSortKey}
          isSortReversed={isSortReversed}
        />

      </Button>
    );
}

const Arrow = ({sortKey, activeSortKey, isSortReversed}) => {
  const angleUp = <FontAwesomeIcon icon={faAngleUp} />
  const angleDown = <FontAwesomeIcon icon={faAngleDown} />

  if ( sortKey !== activeSortKey ){
    return null;
  } else if ( sortKey === 'COMMENTS' || sortKey === 'POINTS' ) {
    if (isSortReversed === true) {
      return angleDown;
    }
    return angleUp;
  } else {
    if (isSortReversed === true ){
      return angleUp;
    }
    return angleDown;
  }

}
const Loading = () => <FontAwesomeIcon icon={faSpinner} size="lg" spin />

const withLoading = Component => ({ isLoading, ...rest }) =>
      isLoading
      ? <Loading />
      : <Component {...rest} />

const ButtonWithLoading = withLoading(Button);

Sort.propTypes = {
  sortKey: PropTypes.string.isRequired,
  onSort: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  activeSortKey: PropTypes.string,
  isSortReversed: PropTypes.bool.isRequired,
}

Arrow.propTypes = {
  sortKey: PropTypes.string.isRequired,
  activeSortKey: PropTypes.string,
  isSortReversed: PropTypes.bool.isRequired,
}

Button.defaultProps = {
  className: '',
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Table.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
        objectID: PropTypes.string.isRequired,
        author: PropTypes.string,
        url: PropTypes.string,
        num_comments: PropTypes.number,
        points: PropTypes.number,
      })
    ).isRequired,
  onDismiss: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  sortKey: PropTypes.string.isRequired,
  isSortReversed: PropTypes.bool.isRequired,
};

Search.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
};



export default App;

export {
  Button,
  Search,
  Table,
};
