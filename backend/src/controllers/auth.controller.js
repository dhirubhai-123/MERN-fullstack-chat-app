// import User from "../models/user.model"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../lib/utills.js"
import cloudinary from "../lib/cloudinary.js"

//everything works correctly 
export const signup = async (req, res) => {
    const { fullName, email, password } = req.body
    console.log(req.body)
    // res.json(req.body)
    try {

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All the fields are required !!" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "password must be minimum 6 chars !!" })
        }

        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: `Email - ${email} already exists !!` })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName: fullName,
            email: email,
            password: hashedPassword,
        })

        if (newUser) {
            generateToken(newUser._id, res)
            await newUser.save()
            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullName,
                email: newUser.email,
                password: newUser.profilePic,
            })
        } else {
            res.status(400).json({ message: "Invalid User Data" })
        }

    } catch (error) {
        console.log("Error in Signup controller ", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

//everything works correctly 
export const login = async (req, res) => {
    const { email, password } = req.body;
    // console.log(req.body)
    // res.json(req.body)

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        generateToken(user._id, res)
        res.status(200).json({
            _id: user._id,
            fullname: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        })

    } catch (error) {
        console.log("Error in Login controller", error)
        res.status(500).json({ message: "Internal Server Error, Login Controller" })
    }
}

//everything works correctly 
export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 })
        res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
        console.log("Error in Logout controller", error)
        res.status(500).json({ message: "Internal Server Error, Logout Controller" })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" })
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updateUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true })

        res.status(200).json({ message: updateUser })

    } catch (error) {
        console.log("Error in updateProfileController")
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth", error.message)
        res.status(500).json({ message: "Internal Server Error, checkAuth" })
    }
}