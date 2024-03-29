import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import moment from "moment";
import { Modal, Button } from 'react-bootstrap';
import "./PostProduct.css";
import Help from '../img/helpicon.png';
import './EditProduct.css';
import BackArrow from "../components/BackArrow";
import { BACKEND_API_URL } from '../config/proxy.js';

// EditProduct component
const EditProduct = () => {
    const location = useLocation();
    const state = location.state || {};

    const { t } = useTranslation();
    const navigate = useNavigate();
    const postId = location.pathname.split("/")[3];

    const [productData, setProductData] = useState({
        product_name: "",
        product_description: "",
    });

    const [selectedAllergies, setSelectedAllergies] = useState([]);
    const [selectedSupermarkets, setSelectedSupermarkets] = useState([]);
    const [file, setFile] = useState(null);
    const [product_name, setProductName] = useState(state?.product_name || "");
    const [product_description, setProductDescription] = useState(state?.product_description || "");
    const [showPopup, setShowPopup] = useState(false);
    const [error, setError] = useState(null); // Placeholder for error

    const hidePopup = () => {
        setShowPopup(false);
    };

    const handleInputChange = (field, value) => {
        setProductData((prevProductData) => ({
            ...prevProductData,
            [field]: value,
        }));
    };

    // Obtains the list of brands from the backend
    const [brands, setBrands] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${BACKEND_API_URL}/brands`);
                console.log(res.data)
                setBrands(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, []);

    // Obtains the list of categories from the backend
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${BACKEND_API_URL}/categories`);
                console.log(res.data)
                setCategories(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, []);

    // Obtains the list of categories from the backend
    const [supermarkets, setSupermarkets] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${BACKEND_API_URL}/markets`);
                setSupermarkets(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, []);

    // Obtains the list of allergies from the backend
    const [allergies, setAllergies] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${BACKEND_API_URL}/allergies`);
                setAllergies(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, []);

    // Function to handle the toggle of the checkboxes
    const handleAllergyToggle = (allergyId) => {
        if (selectedAllergies.includes(allergyId)) {
            setSelectedAllergies(selectedAllergies.filter((id) => id !== allergyId));
        } else {
            setSelectedAllergies([...selectedAllergies, allergyId]);
        }
    };

    const handleClick = async (e) => {
        e.preventDefault();

        try {
            // Patch
            await axios.patch(`${BACKEND_API_URL}/products/${postId}`, {
                product_name: productData.product_name,
                product_description: productData.product_description,
            });
            const productId = postId;
            await Promise.all(selectedAllergies.map(async (idallergies) => {
                await axios.post(`${BACKEND_API_URL}/productallergies/`, {
                    idallergies: idallergies,
                    idproduct: productId
                });
            }));

            hidePopup();
            navigate(`/app/products/${postId}`);
        } catch (err) {
            console.log(err);
        }
    };


    const fetchProductDataFromServer = async () => {
        try {
            console.log("postId:", postId);
            const response = await axios.get(`${BACKEND_API_URL}/products/${postId}`);
            const productData = response.data;
            setProductData(productData);
        } catch (error) {
            console.error("Error:", error.message);
        }
    };

    useEffect(() => {
        fetchProductDataFromServer();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`${BACKEND_API_URL}/products/${postId}`, {
                product_name: productData.product_name,
                product_description: productData.product_description,
            });
            alert("Product updated successfully");
            navigate(`/app/products/${postId}`);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="add-write">
            <BackArrow />

            <div className="content-write">

                <h2 className="supertitle-write">{'Edit My Product'} <span className="text-danger">❤</span></h2>
                <div className="add-write">
                    <div className="content-write">
                        <input
                            type="text"
                            placeholder={t('name_product')}
                            value={productData.product_name}
                            onChange={(e) => handleInputChange("product_name", e.target.value)}
                        />

                        <div className="editorContainer-write">
                            <ReactQuill
                                placeholder={t('product_description')}
                                theme="snow"
                                value={productData.product_description}
                                onChange={(value) => handleInputChange("product_description", value)}
                                modules={{
                                    toolbar: {
                                        container: [
                                            ["bold", "italic", "underline"],
                                        ],
                                    },
                                    clipboard: { matchVisual: false },
                                    mention: false,
                                }}
                            />
                        </div>

                        <legend>{t('allergies')}
                            <Link to={`/app/allergies`}>
                                <img src={Help} alt="Help" className="help-icon" />
                            </Link>
                        </legend>
                        <span>{t('it_contains')}</span>
                        <div className="form-group-post">
                            <fieldset>
                                {allergies.map((allergy) => (
                                    <div key={allergy.id}>
                                        <input type="checkbox" id={allergy.allergy_name} name="alergies[]"
                                            checked={selectedAllergies.includes(allergy.id)}
                                            onChange={() => handleAllergyToggle(allergy.id)}
                                            className="form-check-input" />
                                        <label className="form-check-label" htmlFor={allergy.allergy_name}>{allergy.allergy_name}</label>
                                    </div>
                                ))}
                            </fieldset>
                        </div>

                        <legend>{t('supermarkets')}</legend>
                        <div className="form-group-post">
                            <fieldset>
                                {supermarkets.map((market) => (

                                    <div key={market.id}>
                                        <input type="checkbox"
                                            id={market.name}
                                            name="markets[]"
                                            checked={selectedSupermarkets.includes(market.id)}
                                            className="form-check-input" />

                                        <label htmlFor={market.name}
                                            className="form-check-label">
                                            {market.name}
                                        </label>
                                    </div>

                                ))}
                            </fieldset>
                        </div>

                        <legend>{t('brand')}</legend>
                        <div className="form-group-post">
                            <fieldset>
                                {brands.map((brand) => (

                                    <div key={brand.id}>
                                        <input type="radio"
                                            id={brand.name}
                                            name="idbrand"
                                            value={brand.id}
                                            className="form-check-input" />

                                        <label htmlFor={brand.name}
                                            className="form-check-label">
                                            {brand.name}
                                        </label>
                                    </div>

                                ))}
                            </fieldset>
                        </div>

                        <legend>{t('category')}</legend>
                        <div className="form-group-post">
                            <fieldset>
                                {categories.map((category) => (

                                    <div key={category.id}>
                                        <input type="radio"
                                            id={category.category_name}
                                            name="iccategory"
                                            value={category.id}
                                            className="form-check-input" />

                                        <label htmlFor={category.category_name}
                                            className="form-check-label">
                                            {category.category_name}
                                        </label>
                                    </div>

                                ))}
                            </fieldset>
                        </div>

                        <h3 className="picture-title">{t('update')} 📸</h3>
                        <input
                            type="text"
                            placeholder="Image url"
                        />

                        <div className="image-write">
                            <div className="image-container-write">
                                <input
                                    style={{ display: "none" }}
                                    type="file"
                                    id="file"
                                    name=""
                                />
                                <label className="file-write" htmlFor="file">
                                    {t('upload')}
                                </label>

                            </div>
                        </div>

                        {error && <p className="error-message-write">{error}</p>}
                        <div className="buttons-write-product">
                            <button onClick={() => setShowPopup(true)}>Update</button>
                        </div>

                        <Modal show={showPopup} onHide={hidePopup} centered animation="slide-up">
                            <Modal.Header closeButton>
                                <h4
                                    style={{
                                        marginBottom: "-10px",
                                        marginLeft: "65px",
                                        marginTop: "10px",
                                        textAlign: "center",
                                        fontSize: "25px",
                                    }}
                                    classname="post-popup-text"
                                >
                                    Confirm changes
                                </h4>
                            </Modal.Header>
                            <Modal.Body>
                                <div className="d-flex justify-content-around">
                                    <Button className="cancel"
                                        style={{
                                            padding: "15px 15px",
                                            fontSize: "20px",
                                            backgroundColor: "lightgray",
                                            color: "white",
                                            border: "none",
                                        }}
                                        variant=""
                                        onClick={hidePopup}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        style={{
                                            padding: "15px 15px",
                                            fontSize: "20px",
                                            backgroundColor: "teal",
                                            color: "white",
                                            border: "none",
                                        }}
                                        variant="primary"
                                        onClick={handleClick}
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            </Modal.Body>
                        </Modal>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;