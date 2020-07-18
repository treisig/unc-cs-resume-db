import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import pdf from "../../Static/ResumeTemplate.jpg";

export default class SideResumeBox extends Component {
  // componentDidUpdate(prevProps) {
  //   if (this.props.currentPhoto !== prevProps.currentPhoto) {
  //     console.log(this.props.currentPhoto);
  //     console.log(prevProps.currentPhoto);
  //     this.forceUpdate();
  //   }
  // }
  render() {
    return (
      // 290 by 460

      <Card
        className="SideResumeBoxCard"
        border="dark"
        style={{ height: "460px", width: "290px" }}
      >
        <img
          src={this.props.currentPhoto}
          alt=""
          height="460"
          width="auto"
        ></img>
      </Card>
    );
  }
}
