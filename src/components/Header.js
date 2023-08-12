import {FaCamera, FaCameraRetro} from 'react-icons/fa';
import {Stack} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import {Component} from "react";
import PropTypes from "prop-types";

class Header extends Component {
  static propTypes = {
    getImages: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {};

    this.snapPicture = this.snapPicture.bind(this);
  }

  snapPicture(event) {
    event.target.disabled = true;
    fetch("/snap")
        .then(res => res.json())
        .then(
            (result) => {
              event.target.disabled = false;
              this.props.getImages();
            },
            (error) => {
              event.target.disabled = false;
              console.error(error);
            }
        )
  }

  render() {
    return (
        <div>
          <Stack direction="horizontal" gap={3}>
            <div className=""><FaCameraRetro/> PiCamStudio</div>
            <div className="ms-auto"><Button onClick={this.snapPicture} size="sm" variant="secondary"><FaCamera/> Take
              Picture</Button></div>
          </Stack>
        </div>
    );
  }
}

export default Header;