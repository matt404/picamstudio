import './App.css';
import Body from "./components/Body";
import Menu from "./components/Menu";
import Header from "./components/Header";
import {Col, Container, Row} from "react-bootstrap";
import ImageFolder from "./components/ImageFolder";
import {Component} from "react";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageURIs: [],
      getImages: this.getImages
    };
    this.getImages = this.getImages.bind(this);
  }

  getImages() {
    fetch("/images")
        .then(res => res.json())
        .then(
            (result) => {
              this.setState({imageURIs: result})
            },
            (error) => {
              console.error(error);
            }
        )
  }

  render() {
    return (
        <Container className="vh-100 mw-100 d-flex flex-column" noGutters={true}>
          <Row noGutters={true}>
            <Col className="App-header">
              <Header className="App-header"
                      getImages={this.getImages}/></Col>
          </Row>
          <Row className="AppContainerRow" noGutters={true}>
            <Col className="App-menu" xl={3} lg={3} md={3} sm={4}><Menu/></Col>
            <Col className="App-body" xl={7} lg={6} md={6} sm={5}><Body/></Col>
            <Col className="App-imagefolder" xl={2} lg={3} md={3} sm={3}>
              <ImageFolder
                  imageURIs={this.state.imageURIs}
                  getImages={this.getImages}/>
            </Col>
          </Row>
        </Container>
    );
  }
}

export default App;
