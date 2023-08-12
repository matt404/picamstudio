import {Form} from "react-bootstrap";
import {Component} from "react";

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timerKey: 0,
      FieldEntryTimeoutMS: 500,
      CameraConfigs: {
        AwbEnable: false,
        AwbMode: 0,
        Brightness: 0,
        Contrast: 1.0,
        Saturation: 1.0,
        Sharpness: 1.0,
        HorizontalFlip: 1,
        VerticalFlip: 1
      }
    };

    this.updateFieldState = this.updateFieldState.bind(this);
    this.updateCameraConfig = this.updateCameraConfig.bind(this);

    this.updateAwbEnable = this.updateAwbEnable.bind(this);
    this.updateAwbMode = this.updateAwbMode.bind(this);
    this.updateBrightness = this.updateBrightness.bind(this);
    this.updateContrast = this.updateContrast.bind(this);
    this.updateSaturation = this.updateSaturation.bind(this);
    this.updateSharpness = this.updateSharpness.bind(this);
    this.updateHorizontalFlip = this.updateHorizontalFlip.bind(this);
    this.updateVerticalFlip = this.updateVerticalFlip.bind(this);
  }

  updateCameraConfig() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state.CameraConfigs)
    };
    fetch("/config", requestOptions)
        .then(
            (result) => {},
            (error) => {
              console.error(error);
            }
        )
  }

  updateAwbEnable(event) {
    this.updateFieldState(event.target.id, event.target.value);
  }

  updateAwbMode(event) {
    this.updateFieldState(event.target.id, event.target.value);
  }

  updateBrightness(event) {
    let brightness = parseInt(event.target.value,10) / 10;
    this.updateFieldState(event.target.id, brightness);
  }

  updateContrast(event) {
    let contrast = parseInt(event.target.value,10) / 10;
    this.updateFieldState(event.target.id, contrast);
  }

  updateSaturation(event) {
    let saturation = parseInt(event.target.value,10) / 10;
    this.updateFieldState(event.target.id, saturation);
  }

  updateSharpness(event) {
    let sharpness = parseInt(event.target.value,10) / 10;
    this.updateFieldState(event.target.id, sharpness);
  }

  updateHorizontalFlip(event) {
    this.updateFieldState(event.target.id, event.target.checked ? 1 : 0);
  }

  updateVerticalFlip(event) {
    this.updateFieldState(event.target.id, event.target.checked ? 1 : 0);
  }

  updateFieldState(stateKey, stateValue) {
    if(this.state.timerKey > 0) {
      window.clearTimeout(this.state.timerKey);
      this.setState({timerKey: 0})
    }
    this.setState({timerKey:
          window.setTimeout(function(){
            console.log(stateKey, stateValue);
            let keyVal = {CameraConfigs:{}};
            keyVal.CameraConfigs = this.state.CameraConfigs;
            keyVal.CameraConfigs[stateKey] = stateValue;
            this.setState(keyVal, this.updateCameraConfig);
      }.bind(this),this.state.FieldEntryTimeoutMS)}
    )
  }

  render() {
    return (
        <div>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Check // prettier-ignore
                  onChange={this.updateVerticalFlip}
                  defaultChecked={this.state.CameraConfigs.AwbEnable}
                  size="sm"
                  type={"checkbox"}
                  id={`AwbEnable`}
                  label={`Auto White Balance`}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>Auto White Balance Mode</Form.Label>
              <Form.Select
                  id={"AwbMode"}
                  onChange={this.updateAwbMode}
                  defaultValue={this.state.CameraConfigs.AwbMode}
                  size="sm">
                <option value="0">auto</option>
                <option value="1">incandescent</option>
                <option value="2">tungsten</option>
                <option value="3">fluorescent</option>
                <option value="4">indoor</option>
                <option value="5">daylight</option>
                <option value="6">cloudy</option>
                <option value="7">custom</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>Brightness</Form.Label>
              <Form.Range id={"Brightness"} onChange={this.updateBrightness} size="sm"
                          defaultValue={this.state.CameraConfigs.Brightness}
                          max={10}
                          min={-10}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>Contrast</Form.Label>
              <Form.Range id={"Contrast"} onChange={this.updateContrast} size="sm" defaultValue={this.state.CameraConfigs.Contrast}
                          max={320}
                          min={0}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>Saturation</Form.Label>
              <Form.Range id={"Saturation"} onChange={this.updateSaturation} size="sm"
                          defaultValue={this.state.CameraConfigs.Saturation}
                          max={320}
                          min={0}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>Sharpness</Form.Label>
              <Form.Range id={"Sharpness"} onChange={this.updateSharpness} size="sm" defaultValue={this.state.CameraConfigs.Sharpness}
                          max={160}
                          min={0}/>
            </Form.Group>
            <Form.Check // prettier-ignore
                onChange={this.updateHorizontalFlip}
                defaultChecked={this.state.CameraConfigs.HorizontalFlip === 1}
                size="sm"
                type={"checkbox"}
                id={`HorizontalFlip`}
                label={`Horizontal Flip`}
            />
            <Form.Check // prettier-ignore
                onChange={this.updateVerticalFlip}
                defaultChecked={this.state.CameraConfigs.VerticalFlip === 1}
                size="sm"
                type={"checkbox"}
                id={`VerticalFlip`}
                label={`Vertical Flip`}
            />
          </Form>
        </div>
    );
  }
}

export default Menu;