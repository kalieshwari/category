const React = require('react');
const ReactDOM = require('react-dom');
const axios = require('axios');

// These should probably be imported from a constants.js file
const CATEGORIES_ENDPOINT = 'https://localhost:3000/category';
//const CATEGORIES_ENDPOINT = 'https://api.gousto.co.uk/products/v2.0/categories';
//const PRODUCTS_ENDPOINT = 'https://api.gousto.co.uk/products/v2.0/products?includes[]=categories&includes[]=attributes&sort=position&image_sizes[]=365&image_sizes[]=400&period_id=120';

const NavContainer = React.createClass({
  // All your state lives in your topmost container and is
  // passed down to any component that needs it
  getInitialState() {
    return {
      categories: [],
      items: [],
      selectedCategoryId: null
    }
  },

  // Generic method that's used to set a selectedCategoryId
  // Can now be passed into any component that needs to select a category without needing to worry about dealing with events and whatnot
  selectCategory(category) {
    this.setState({
      selectedCategoryId: category
    });
  },

  componentDidMount() {
    this.serverRequest = axios.all([
      axios.get(CATEGORIES_ENDPOINT)
     // axios.get(PRODUCTS_ENDPOINT)
    ])
    .then(axios.spread((categoriesResponse, itemsResponse) => {
      console.log('Categories', categoriesResponse.data.data);
      console.log('Item', itemsResponse.data.data);

      // This `this` should work due to ES6 arrow functions
      this.setState({
        categories: categoriesResponse.data.data,
        items : itemsResponse.data.data
      });
    }));
  },

  componentWillUnmount() {
    this.serverRequest.abort();
  },

  render() {
    // ABD: Always Be Destructuring
    const {
      categories,
      items,
      selectedCategoryId
    } = this.state;

    return (
      <div className="navigation">
        <h1>
          Store Cupboard
        </h1>

        <NavigationCategoryList
          categories={categories}
          // Pass the select function into the category list
          // so the category items can call it when clicked
          selectCategory={this.selectCategory} />

        <NavigationSubCategoryList
          items={items}
          // Pass the selected category into the list of items
          // to be used for filtering the list
          selectedCategoryId={selectedCategoryId} />
      </div>
    );
  }
});

const NavigationCategory = React.createClass({
   handleClick(e) {
    const { id, selectCategory } = this.props;
    e.preventDefault();
    selectCategory(id);
  },

  render() {
    const { id, title } = this.props;
    return (
      <div className="navigationLink">
        <a href={id} onClick={this.handleClick}>
          {title}
        </a>
      </div>
    );
  }
});
const NavigationCategoryList = React.createClass({
  // rather than being redefined every time there's a rerender
  renderCategories() {
    const { selectCategory, categories } = this.props;

    return categories.map(category => {
      const { id, title } = category;
      return (
        <NavigationCategory
          // Every time you have a list you need a key prop
          key={id}
          title={title}
          id={id}
          selectCategory={selectCategory} />
      );
    });
  },

  render() {
    return (
      <div>
        <div className="navigationCategory">
          {this.renderCategories()}
        </div>
      </div>
    );
  }
});

const NavigationSubCategoryLink = React.createClass({
  render() {
    const { name } = this.props;
    return (
      <div className="navigationSubCategory" id={name}>
        {name}
      </div>
    );
  }
});
const NavigationSubCategoryList = React.createClass({
  renderSubCategories() {
    const { selectedCategoryId, items } = this.props;
    // This is the key to filtering based on selectedCategoryId
    return items.filter(item => {
      // Checking all the categories in the item's categories array
      // against the selectedCategoryId passed in from props
      return item.categories.some(category => {
        return category.id === selectedCategoryId;
      });
    })
    .map(item => {
      const { title, link, id } = item;
      return (
        <NavigationSubCategoryLink
          key={id}
          name={title}
          link={link} />
      );
    });
  },

  render() {
    return (
      <div className="subCategoryContainer">
        {this.renderSubCategories()}
      </div>
    );
  }
});

ReactDOM.render(<NavContainer />, document.getElementById('app'));

/*router.get('/fetchdata', function(req, res, next) {
  var id = req.query.id;
  MongoClient.connect(dburl, function(err, db) {
   if(err) {  console.log(err); throw err;  }
   data = '';
   db.collection('products').find({_id: new mongodb.ObjectID(id)}).toArray(function(err, docs){
     if(err) throw err;
     res.send(docs);
     db.close();
   });
 });
});*/