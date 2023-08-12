import {Component} from "react";
import PropTypes from "prop-types";

class ImageFolder extends Component {
    static propTypes = {
        imageURIs: PropTypes.array,
        getImages: PropTypes.func
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.props.getImages();
    }

    render() {
        return (
            <div>
                <h4>Captured Images</h4>
                <ul>
                    {this.props.imageURIs && this.props.imageURIs.map(( imageURI, index ) => {
                    return(
                        <li><a href={"/image/" + imageURI}
                               rel="noreferrer"
                               className="App-link"
                               target="_blank">{imageURI}</a></li>
                    )})}
                </ul>
            </div>
        );
    }
}
export default ImageFolder;