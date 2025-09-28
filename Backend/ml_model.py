import torch
import torch.nn as nn

class EmbeddingMLP(nn.Module):
    def __init__(self, num_numeric, cat_dims, n_classes, emb_szs=None, hidden=[512,256], dropout=0.3):
        super().__init__()
        # กำหนด embedding size สำหรับแต่ละ categorical feature
        if emb_szs is None:
            emb_szs = [min(50, (d+1)//2) for d in cat_dims]
        self.emb_layers = nn.ModuleList([nn.Embedding(n, e) for n, e in zip(cat_dims, emb_szs)])
        
        emb_total = sum(emb_szs)
        input_dim = num_numeric + emb_total

        layers = []
        in_dim = input_dim
        for h in hidden:
            layers += [nn.Linear(in_dim, h), nn.ReLU(), nn.Dropout(dropout)]
            in_dim = h
        layers.append(nn.Linear(in_dim, n_classes))  # multi-class
        self.net = nn.Sequential(*layers)

    def forward(self, x_num, x_cat):
        emb = [layer(x_cat[:, i]) for i, layer in enumerate(self.emb_layers)]
        x = torch.cat([x_num] + emb, dim=1)
        return self.net(x)   # raw logits

# parameter ต้องตรงกับตอน train
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
num_numeric = 25   # จำนวน numeric features
cat_dims = [2]  # dimension ของ categorical features แต่ละ column
n_classes = 5      # จำนวน class lifestyle


model = EmbeddingMLP(num_numeric, cat_dims, n_classes)
model.load_state_dict(torch.load("./lifestyle_mlp.pth", map_location=device))
model.to(device)
model.eval()

class_mapping = {
    2: "Sustainability",
    4: "Travel & Adventure",
    0: "Finance/Professional",
    1: "Health & Fitness",
    3: "Tech/Digital"
}

def predict_with_both(x_num, x_cat, threshold=0.6):
    model.eval()
    with torch.no_grad():
        logits = model(x_num.to(device), x_cat.to(device))

        # ---------- Multiclass ----------
        probs_softmax = torch.softmax(logits, dim=1)
        pred_class_idx = probs_softmax.argmax(dim=1).item()
        pred_class_name = class_mapping[pred_class_idx]

        # ---------- Multilabel ----------
        probs_sigmoid = torch.sigmoid(logits)
        pred_multilabel_idx = (probs_sigmoid > threshold).nonzero(as_tuple=True)[1].tolist()
        pred_multilabel_names = [class_mapping[i] for i in pred_multilabel_idx]

    return {
        "softmax_probs": probs_softmax.cpu().numpy().round(3).tolist(),
        "pred_class_idx": pred_class_idx,
        "pred_class_name": pred_class_name,
        "sigmoid_probs": probs_sigmoid.cpu().numpy().round(3).tolist(),
        "pred_multilabel_idx": pred_multilabel_idx,
        "pred_multilabel_names": pred_multilabel_names
    }