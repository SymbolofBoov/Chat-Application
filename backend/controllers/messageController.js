import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
// import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req,res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const {message} = req.body;

        let gotConversation = await Conversation.findOne({
            participants:{$all : [senderId, receiverId]},
        });

        if(!gotConversation){
            gotConversation = await Conversation.create({
                participants:[senderId, receiverId]
            })
        };
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });
        if(newMessage){
            gotConversation.messages.push(newMessage._id);
        };
        

        await Promise.all([gotConversation.save(), newMessage.save()]);
         
        // // SOCKET IO
        // const receiverSocketId = getReceiverSocketId(receiverId);
        // if(receiverSocketId){
        //     io.to(receiverSocketId).emit("newMessage", newMessage);
        // }
        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage,
       });
    } catch (error) {
        console.log(error);
    }
}
export const getMessage = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.id;

    if (!senderId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    return res.status(200).json({ messages: conversation.messages });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};